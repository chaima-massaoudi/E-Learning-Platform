const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('./models/User');
const Profile = require('./models/Profile');
const Course = require('./models/Course');
const Category = require('./models/Category');
const Review = require('./models/Review');

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing data
        await User.deleteMany({});
        await Profile.deleteMany({});
        await Course.deleteMany({});
        await Category.deleteMany({});
        await Review.deleteMany({});
        console.log('Données existantes supprimées...');

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Développement Web', description: 'HTML, CSS, JavaScript, React, Node.js' },
            { name: 'Data Science', description: 'Python, Machine Learning, IA' },
            { name: 'Mobile', description: 'React Native, Flutter, iOS, Android' },
            { name: 'Design', description: 'UI/UX, Figma, Adobe XD' },
            { name: 'DevOps', description: 'Docker, Kubernetes, CI/CD' },
            { name: 'Base de données', description: 'SQL, MongoDB, PostgreSQL' },
        ]);
        console.log('Catégories créées...');

        // Create Admin User (password will be hashed by User model pre-save hook)
        const admin = await User.create({
            email: 'admin@elearning.com',
            password: 'admin123',  // Will be hashed automatically
            role: 'admin',
        });
        const adminProfile = await Profile.create({
            user: admin._id,
            firstName: 'Admin',
            lastName: 'System',
            bio: 'Administrateur de la plateforme',
        });
        await User.findByIdAndUpdate(admin._id, { profile: adminProfile._id });

        // Create Instructor User
        const instructor = await User.create({
            email: 'prof@elearning.com',
            password: 'instructor123',  // Will be hashed automatically
            role: 'instructor',
        });
        const instructorProfile = await Profile.create({
            user: instructor._id,
            firstName: 'Mohamed',
            lastName: 'Ben Ali',
            bio: 'Expert en développement web avec 10 ans d\'expérience',
        });
        await User.findByIdAndUpdate(instructor._id, { profile: instructorProfile._id });

        // Create Second Instructor
        const instructor2 = await User.create({
            email: 'sarah@elearning.com',
            password: 'instructor123',  // Will be hashed automatically
            role: 'instructor',
        });
        const instructor2Profile = await Profile.create({
            user: instructor2._id,
            firstName: 'Sarah',
            lastName: 'Mansouri',
            bio: 'Data Scientist passionnée par l\'IA',
        });
        await User.findByIdAndUpdate(instructor2._id, { profile: instructor2Profile._id });

        // Create Student User
        const student = await User.create({
            email: 'student@elearning.com',
            password: 'student123',  // Will be hashed automatically
            role: 'student',
        });
        const studentProfile = await Profile.create({
            user: student._id,
            firstName: 'Ahmed',
            lastName: 'Trabelsi',
            bio: 'Étudiant passionné par la programmation',
        });
        await User.findByIdAndUpdate(student._id, { profile: studentProfile._id });
        console.log('Utilisateurs créés...');

        // Create Courses
        const courses = await Course.insertMany([
            {
                title: 'React.js - Le Guide Complet 2024',
                description: 'Apprenez React.js de zéro à expert! Ce cours couvre les hooks, Redux, React Router, et les meilleures pratiques. Vous construirez plusieurs projets réels pour maîtriser cette bibliothèque JavaScript populaire.',
                price: 49.99,
                level: 'débutant',
                duration: 32,
                instructor: instructor._id,
                categories: [categories[0]._id],
                isPublished: true,
            },
            {
                title: 'Node.js & Express - API REST Complète',
                description: 'Créez des APIs REST professionnelles avec Node.js et Express. Apprenez MongoDB, l\'authentification JWT, et le déploiement. Projet final: créer une API e-commerce complète.',
                price: 59.99,
                level: 'intermédiaire',
                duration: 28,
                instructor: instructor._id,
                categories: [categories[0]._id, categories[5]._id],
                isPublished: true,
            },
            {
                title: 'Python pour la Data Science',
                description: 'Maîtrisez Python pour l\'analyse de données. Pandas, NumPy, Matplotlib, et introduction au Machine Learning avec Scikit-learn. Nombreux exercices pratiques inclus.',
                price: 69.99,
                level: 'débutant',
                duration: 40,
                instructor: instructor2._id,
                categories: [categories[1]._id],
                isPublished: true,
            },
            {
                title: 'Machine Learning de A à Z',
                description: 'Comprenez et implémentez les algorithmes de Machine Learning. Régression, Classification, Clustering, Deep Learning. TensorFlow et Keras inclus.',
                price: 89.99,
                level: 'avancé',
                duration: 55,
                instructor: instructor2._id,
                categories: [categories[1]._id],
                isPublished: true,
            },
            {
                title: 'React Native - Applications Mobiles',
                description: 'Développez des applications mobiles natives pour iOS et Android avec React Native. Projet: créer une app de messagerie complète.',
                price: 54.99,
                level: 'intermédiaire',
                duration: 35,
                instructor: instructor._id,
                categories: [categories[2]._id, categories[0]._id],
                isPublished: true,
            },
            {
                title: 'UI/UX Design avec Figma',
                description: 'Apprenez à concevoir des interfaces utilisateur modernes et intuitives. Prototypage, Design Systems, et collaboration d\'équipe.',
                price: 39.99,
                level: 'débutant',
                duration: 20,
                instructor: instructor2._id,
                categories: [categories[3]._id],
                isPublished: true,
            },
            {
                title: 'Docker & Kubernetes pour Débutants',
                description: 'Conteneurisez vos applications avec Docker et orchestrez-les avec Kubernetes. DevOps moderne et déploiement cloud.',
                price: 64.99,
                level: 'intermédiaire',
                duration: 25,
                instructor: instructor._id,
                categories: [categories[4]._id],
                isPublished: true,
            },
            {
                title: 'MongoDB - Base de Données NoSQL',
                description: 'Maîtrisez MongoDB du débutant à l\'expert. Aggregation, Indexes, Réplication, et performances. Intégration avec Node.js.',
                price: 44.99,
                level: 'débutant',
                duration: 18,
                instructor: instructor._id,
                categories: [categories[5]._id],
                isPublished: true,
            },
        ]);
        console.log('Cours créés...');

        // Update categories with courses
        for (const course of courses) {
            for (const catId of course.categories) {
                await Category.findByIdAndUpdate(catId, {
                    $push: { courses: course._id },
                });
            }
        }

        // Enroll student in some courses
        const coursesToEnroll = [courses[0]._id, courses[2]._id, courses[5]._id];
        await User.findByIdAndUpdate(student._id, { enrolledCourses: coursesToEnroll });

        for (const courseId of coursesToEnroll) {
            await Course.findByIdAndUpdate(courseId, {
                $push: { enrolledStudents: student._id },
            });
        }

        // Create Reviews
        await Review.insertMany([
            {
                rating: 5,
                comment: 'Excellent cours! J\'ai appris énormément. Le professeur explique très bien.',
                user: student._id,
                course: courses[0]._id,
            },
            {
                rating: 4,
                comment: 'Très bon contenu, quelques passages un peu rapides mais globalement super.',
                user: student._id,
                course: courses[2]._id,
            },
            {
                rating: 5,
                comment: 'Parfait pour débuter en design! Les projets pratiques sont très utiles.',
                user: student._id,
                course: courses[5]._id,
            },
        ]);
        console.log('Reviews créées...');

        console.log('\n✅ Base de données initialisée avec succès!\n');
        console.log('📧 Comptes créés:');
        console.log('   Admin:      admin@elearning.com / admin123');
        console.log('   Instructor: prof@elearning.com / instructor123');
        console.log('   Instructor: sarah@elearning.com / instructor123');
        console.log('   Student:    student@elearning.com / student123');
        console.log('\n📚 8 cours créés');
        console.log('📁 6 catégories créées');
        console.log('⭐ 3 reviews créées\n');

        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
};

seedData();
