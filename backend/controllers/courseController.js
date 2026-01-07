/**
 * =========================================================================
 * CONTRÔLEUR DES COURS
 * =========================================================================
 * 
 * Ce contrôleur gère toutes les opérations CRUD sur les cours:
 * - Lister tous les cours publiés
 * - Récupérer les détails d'un cours
 * - Créer un nouveau cours (instructeur/admin)
 * - Modifier un cours existant
 * - Supprimer un cours
 * - Inscription/Désinscription à un cours
 * 
 * RELATIONS GÉRÉES:
 * - 1-to-Many: Instructor → Courses
 * - Many-to-Many: Users ↔ Courses (inscriptions)
 * - Many-to-Many: Courses ↔ Categories
 * 
 * @author Chaima Massaoudi
 */

// =========================================================================
// IMPORTATION DES DÉPENDANCES
// =========================================================================

// express-async-handler - Wrapper pour gérer les exceptions async
const asyncHandler = require('express-async-handler');

// Modèles Mongoose
const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');

// =========================================================================
// CONTRÔLEURS - LECTURE (READ)
// =========================================================================

/**
 * @desc    Récupérer tous les cours publiés
 * @route   GET /api/courses
 * @access  Public (pas de token requis)
 * 
 * Cette fonction retourne uniquement les cours avec isPublished: true
 * Les cours en brouillon ne sont pas visibles publiquement
 */
const getAllCourses = asyncHandler(async (req, res) => {
    // Rechercher tous les cours publiés
    const courses = await Course.find({ isPublished: true })
        .populate('instructor', 'email')   // Inclure l'email de l'instructeur
        .populate('categories', 'name')    // Inclure les noms des catégories
        .populate('reviews');              // Inclure les avis pour calculer la moyenne

    res.json(courses);
});

/**
 * @desc    Récupérer un cours par son ID
 * @route   GET /api/courses/:id
 * @access  Public
 * 
 * Cette fonction retourne les détails complets d'un cours
 * avec toutes les relations populées
 */
const getCourseById = asyncHandler(async (req, res) => {
    // Rechercher le cours par son ID (req.params.id vient de l'URL)
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'email')       // Email de l'instructeur
        .populate('categories', 'name description')  // Catégories complètes
        .populate({
            path: 'reviews',                   // Avis du cours
            populate: { path: 'user', select: 'email' },  // Auteur de chaque avis
        })
        .populate('enrolledStudents', 'email'); // Étudiants inscrits

    // Vérifier si le cours existe
    if (!course) {
        res.status(404);  // Not Found
        throw new Error('Cours non trouvé');
    }

    res.json(course);
});

/**
 * @desc    Récupérer les cours d'un instructeur
 * @route   GET /api/courses/instructor/:instructorId
 * @access  Public
 * 
 * Permet de voir tous les cours créés par un instructeur spécifique
 */
const getCoursesByInstructor = asyncHandler(async (req, res) => {
    // Rechercher les cours par l'ID de l'instructeur
    const courses = await Course.find({ instructor: req.params.instructorId })
        .populate('instructor', 'email')
        .populate('categories', 'name');

    res.json(courses);
});

// =========================================================================
// CONTRÔLEURS - CRÉATION (CREATE)
// =========================================================================

/**
 * @desc    Créer un nouveau cours
 * @route   POST /api/courses
 * @access  Private/Instructor (rôle instructor ou admin requis)
 * 
 * Cette fonction:
 * 1. Crée le cours avec l'utilisateur connecté comme instructeur
 * 2. Met à jour les catégories pour inclure ce cours (Many-to-Many)
 * 3. Retourne le cours créé avec les relations populées
 */
const createCourse = asyncHandler(async (req, res) => {
    // Extraire les données du corps de la requête
    const { title, description, price, image, level, duration, categories, isPublished } = req.body;

    // Créer le cours dans la base de données
    const course = await Course.create({
        title,
        description,
        price,
        image,
        level,
        duration,
        categories: categories || [],      // Tableau vide si non spécifié
        instructor: req.user._id,          // L'utilisateur connecté est l'instructeur
        isPublished: isPublished || false, // Brouillon par défaut
    });

    // SYNCHRONISATION Many-to-Many: Ajouter ce cours aux catégories
    // Chaque catégorie doit référencer ce cours dans son tableau 'courses'
    if (categories && categories.length > 0) {
        await Category.updateMany(
            { _id: { $in: categories } },          // Sélectionner les catégories
            { $addToSet: { courses: course._id } } // Ajouter le cours (évite les doublons)
        );
    }

    // Récupérer le cours créé avec les relations populées
    const populatedCourse = await Course.findById(course._id)
        .populate('instructor', 'email')
        .populate('categories', 'name');

    res.status(201).json(populatedCourse);  // 201 Created
});

// =========================================================================
// CONTRÔLEURS - MODIFICATION (UPDATE)
// =========================================================================

/**
 * @desc    Mettre à jour un cours existant
 * @route   PUT /api/courses/:id
 * @access  Private/Instructor (créateur du cours ou admin)
 * 
 * Cette fonction:
 * 1. Vérifie que le cours existe
 * 2. Vérifie que l'utilisateur est autorisé (créateur ou admin)
 * 3. Met à jour les champs fournis
 * 4. Synchronise les catégories si modifiées
 */
const updateCourse = asyncHandler(async (req, res) => {
    // Rechercher le cours à modifier
    const course = await Course.findById(req.params.id);

    // Vérifier si le cours existe
    if (!course) {
        res.status(404);
        throw new Error('Cours non trouvé');
    }

    // VÉRIFICATION D'AUTORISATION
    // Seul le créateur du cours ou un admin peut le modifier
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);  // Forbidden
        throw new Error('Non autorisé à modifier ce cours');
    }

    // Extraire les nouvelles données
    const { title, description, price, image, level, duration, categories, isPublished } = req.body;

    // Mettre à jour uniquement les champs fournis
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (image !== undefined) course.image = image;
    if (level) course.level = level;
    if (duration !== undefined) course.duration = duration;
    if (isPublished !== undefined) course.isPublished = isPublished;

    // SYNCHRONISATION Many-to-Many: Gérer les catégories
    if (categories) {
        // 1. Retirer ce cours des anciennes catégories
        await Category.updateMany(
            { courses: course._id },
            { $pull: { courses: course._id } }
        );

        // 2. Ajouter ce cours aux nouvelles catégories
        await Category.updateMany(
            { _id: { $in: categories } },
            { $addToSet: { courses: course._id } }
        );

        // 3. Mettre à jour le tableau categories du cours
        course.categories = categories;
    }

    // Sauvegarder les modifications
    const updatedCourse = await course.save();

    // Retourner le cours mis à jour avec les relations populées
    const populatedCourse = await Course.findById(updatedCourse._id)
        .populate('instructor', 'email')
        .populate('categories', 'name');

    res.json(populatedCourse);
});

// =========================================================================
// CONTRÔLEURS - SUPPRESSION (DELETE)
// =========================================================================

/**
 * @desc    Supprimer un cours
 * @route   DELETE /api/courses/:id
 * @access  Private/Instructor (créateur du cours ou admin)
 * 
 * Cette fonction:
 * 1. Vérifie l'existence et l'autorisation
 * 2. Nettoie les références Many-to-Many
 * 3. Supprime le cours de la base de données
 */
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        res.status(404);
        throw new Error('Cours non trouvé');
    }

    // Vérifier l'autorisation
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Non autorisé à supprimer ce cours');
    }

    // NETTOYAGE Many-to-Many: Retirer le cours des catégories
    await Category.updateMany(
        { courses: course._id },
        { $pull: { courses: course._id } }
    );

    // NETTOYAGE Many-to-Many: Retirer le cours des inscriptions des étudiants
    await User.updateMany(
        { enrolledCourses: course._id },
        { $pull: { enrolledCourses: course._id } }
    );

    // Supprimer le cours
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Cours supprimé avec succès', id: req.params.id });
});

// =========================================================================
// CONTRÔLEURS - INSCRIPTION (ENROLLMENT)
// =========================================================================

/**
 * @desc    S'inscrire à un cours
 * @route   POST /api/courses/:id/enroll
 * @access  Private (utilisateur connecté)
 * 
 * RELATION Many-to-Many: User ↔ Course
 * - Ajoute l'utilisateur à course.enrolledStudents
 * - Ajoute le cours à user.enrolledCourses
 */
const enrollInCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        res.status(404);
        throw new Error('Cours non trouvé');
    }

    // Vérifier si l'utilisateur est déjà inscrit
    if (course.enrolledStudents.includes(req.user._id)) {
        res.status(400);  // Bad Request
        throw new Error('Vous êtes déjà inscrit à ce cours');
    }

    // Ajouter l'étudiant au cours (côté Course)
    course.enrolledStudents.push(req.user._id);
    await course.save();

    // Ajouter le cours à l'utilisateur (côté User)
    // $addToSet évite les doublons
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { enrolledCourses: course._id },
    });

    res.json({ message: 'Inscription réussie', courseId: course._id });
});

/**
 * @desc    Se désinscrire d'un cours
 * @route   DELETE /api/courses/:id/enroll
 * @access  Private (utilisateur connecté)
 * 
 * Inverse de enrollInCourse: retire les références des deux côtés
 */
const unenrollFromCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        res.status(404);
        throw new Error('Cours non trouvé');
    }

    // Vérifier si l'utilisateur est inscrit
    if (!course.enrolledStudents.includes(req.user._id)) {
        res.status(400);
        throw new Error("Vous n'êtes pas inscrit à ce cours");
    }

    // Retirer l'étudiant du cours (côté Course)
    course.enrolledStudents = course.enrolledStudents.filter(
        (id) => id.toString() !== req.user._id.toString()
    );
    await course.save();

    // Retirer le cours de l'utilisateur (côté User)
    // $pull supprime l'élément du tableau
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { enrolledCourses: course._id },
    });

    res.json({ message: 'Désinscription réussie', courseId: course._id });
});

// =========================================================================
// EXPORT DES FONCTIONS
// =========================================================================

module.exports = {
    getAllCourses,          // GET /api/courses
    getCourseById,          // GET /api/courses/:id
    createCourse,           // POST /api/courses
    updateCourse,           // PUT /api/courses/:id
    deleteCourse,           // DELETE /api/courses/:id
    enrollInCourse,         // POST /api/courses/:id/enroll
    unenrollFromCourse,     // DELETE /api/courses/:id/enroll
    getCoursesByInstructor, // GET /api/courses/instructor/:instructorId
};
