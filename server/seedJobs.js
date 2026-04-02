const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dataworks');
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Find or create a default user for posting jobs
    let defaultUser = await User.findOne({ email: 'admin@dataworks.com' });
    if (!defaultUser) {
      defaultUser = await User.create({
        name: 'DataWorks Admin',
        email: 'admin@dataworks.com',
        password: 'admin123',
        role: 'admin'
      });
    }

    const jobs = [
      {
        title: 'Senior Data Engineer',
        company: 'DataWorks Agency',
        location: 'Remote',
        type: 'Full-time',
        experience: 'Senior Level',
        category: 'Data Engineering',
        salary: '$120,000 - $160,000',
        description: 'We are looking for a Senior Data Engineer to join our team and build scalable data pipelines using Apache Spark, Kafka, and Airflow. You will work on enterprise-grade data infrastructure processing millions of events daily.',
        requirements: [
          '5+ years of experience in data engineering',
          'Expert in Python and SQL',
          'Experience with Spark and Kafka',
          'Strong problem-solving skills',
          'Experience with cloud platforms (AWS, Azure, or GCP)'
        ],
        skills: ['Python', 'SQL', 'Spark', 'Kafka', 'Airflow', 'Snowflake', 'AWS'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Data Scientist',
        company: 'TechCorp',
        location: 'New York, NY',
        type: 'Full-time',
        experience: 'Mid Level',
        category: 'Data Science',
        salary: '$100,000 - $140,000',
        description: 'Join our data science team to develop machine learning models and provide actionable insights. You will work on predictive analytics, recommendation systems, and natural language processing projects.',
        requirements: [
          '3+ years of experience in data science',
          'Strong statistical background',
          'Experience with TensorFlow or PyTorch',
          'Excellent communication skills',
          'PhD or Master\'s in related field preferred'
        ],
        skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy', 'SQL', 'Statistics'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Data Analytics Intern',
        company: 'DataWorks Agency',
        location: 'Remote',
        type: 'Internship',
        experience: 'Entry Level',
        category: 'Data Analytics',
        salary: '$25/hour',
        description: '6-month internship program to learn data analytics and visualization tools. You will work on real-world projects, create dashboards, and learn from experienced data professionals.',
        requirements: [
          'Currently pursuing degree in related field',
          'Basic knowledge of SQL',
          'Eagerness to learn',
          'Strong analytical skills',
          'Good communication skills'
        ],
        skills: ['SQL', 'Tableau', 'Power BI', 'Excel', 'Python'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Machine Learning Engineer',
        company: 'AI Solutions',
        location: 'San Francisco, CA',
        type: 'Full-time',
        experience: 'Senior Level',
        category: 'Machine Learning',
        salary: '$140,000 - $180,000',
        description: 'Build and deploy machine learning models at scale for production environments. You will work on computer vision, NLP, and recommendation systems serving millions of users.',
        requirements: [
          '5+ years of experience in ML engineering',
          'Expert in Python and TensorFlow',
          'Experience with model deployment',
          'Strong software engineering skills',
          'Experience with MLOps and CI/CD pipelines'
        ],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes', 'AWS', 'MLOps'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'ETL Developer',
        company: 'DataFlow Inc',
        location: 'Chicago, IL',
        type: 'Contract',
        experience: 'Mid Level',
        category: 'ETL Development',
        salary: '$80/hour',
        description: 'Design and implement ETL processes for data integration and transformation. You will work with multiple data sources and build reliable data pipelines.',
        requirements: [
          '3+ years of ETL development experience',
          'Expert in SQL',
          'Experience with Informatica or Talend',
          'Strong data modeling skills',
          'Experience with data quality and validation'
        ],
        skills: ['SQL', 'Informatica', 'Talend', 'Python', 'Data Modeling', 'ETL'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Business Intelligence Analyst',
        company: 'Analytics Pro',
        location: 'Boston, MA',
        type: 'Full-time',
        experience: 'Mid Level',
        category: 'Business Intelligence',
        salary: '$90,000 - $120,000',
        description: 'Create interactive dashboards and reports to support business decision-making. You will work with stakeholders to understand requirements and deliver actionable insights.',
        requirements: [
          '3+ years of BI experience',
          'Expert in Tableau or Power BI',
          'Strong SQL skills',
          'Excellent communication skills',
          'Experience with data warehousing concepts'
        ],
        skills: ['Tableau', 'Power BI', 'SQL', 'Excel', 'Data Visualization', 'Business Intelligence'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Data Engineering Intern',
        company: 'DataWorks Agency',
        location: 'Remote',
        type: 'Internship',
        experience: 'Entry Level',
        category: 'Data Engineering',
        salary: '$30/hour',
        description: '6-month internship to learn data pipeline development and cloud technologies. You will work alongside senior engineers on real data infrastructure projects.',
        requirements: [
          'Currently pursuing CS or related degree',
          'Basic programming skills',
          'Interest in data engineering',
          'Strong problem-solving abilities',
          'Eagerness to learn new technologies'
        ],
        skills: ['Python', 'SQL', 'AWS', 'Docker', 'Git', 'Linux'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Product Manager - Data Platform',
        company: 'TechStartup',
        location: 'Austin, TX',
        type: 'Full-time',
        experience: 'Senior Level',
        category: 'Product Management',
        salary: '$130,000 - $160,000',
        description: 'Lead product strategy for our data platform and analytics products. You will work with engineering, design, and business teams to deliver world-class data solutions.',
        requirements: [
          '5+ years of product management experience',
          'Experience with data products',
          'Strong technical background',
          'Excellent leadership skills',
          'Experience with Agile methodologies'
        ],
        skills: ['Product Strategy', 'Data Analytics', 'Agile', 'Stakeholder Management', 'Roadmapping'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Big Data Engineer',
        company: 'DataScale Inc',
        location: 'Seattle, WA',
        type: 'Full-time',
        experience: 'Senior Level',
        category: 'Big Data',
        salary: '$130,000 - $170,000',
        description: 'Build and maintain big data infrastructure using Spark, Hadoop, and cloud technologies. You will work on petabyte-scale data processing systems.',
        requirements: [
          '5+ years of big data experience',
          'Expert in Spark and Hadoop',
          'Experience with cloud platforms',
          'Strong performance optimization skills',
          'Experience with data lake architectures'
        ],
        skills: ['Spark', 'Hadoop', 'Python', 'AWS', 'Data Lake', 'Performance Optimization'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Data Visualization Specialist',
        company: 'VizCorp',
        location: 'Remote',
        type: 'Full-time',
        experience: 'Mid Level',
        category: 'Data Visualization',
        salary: '$85,000 - $110,000',
        description: 'Create stunning data visualizations and interactive dashboards. You will transform complex data into clear, actionable insights for stakeholders.',
        requirements: [
          '3+ years of data visualization experience',
          'Expert in Tableau or Power BI',
          'Strong design skills',
          'Experience with D3.js or similar libraries',
          'Excellent storytelling abilities'
        ],
        skills: ['Tableau', 'Power BI', 'D3.js', 'Data Visualization', 'Design', 'Storytelling'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'Data Warehousing Engineer',
        company: 'WarehousePro',
        location: 'Denver, CO',
        type: 'Full-time',
        experience: 'Senior Level',
        category: 'Data Warehousing',
        salary: '$120,000 - $150,000',
        description: 'Design and implement modern data warehouses on Snowflake and BigQuery. You will work on data modeling, ETL processes, and performance optimization.',
        requirements: [
          '5+ years of data warehousing experience',
          'Expert in Snowflake or BigQuery',
          'Strong data modeling skills',
          'Experience with dbt',
          'Performance optimization expertise'
        ],
        skills: ['Snowflake', 'BigQuery', 'dbt', 'Data Modeling', 'SQL', 'Performance Optimization'],
        postedBy: defaultUser._id,
        status: 'active'
      },
      {
        title: 'AI Development Intern',
        company: 'DataWorks Agency',
        location: 'Remote',
        type: 'Internship',
        experience: 'Entry Level',
        category: 'AI Development',
        salary: '$28/hour',
        description: '6-month internship to learn AI and machine learning development. You will work on real AI projects and learn from experienced ML engineers.',
        requirements: [
          'Currently pursuing CS or AI related degree',
          'Basic knowledge of Python',
          'Interest in machine learning',
          'Strong mathematical background',
          'Eagerness to learn'
        ],
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Mathematics', 'Statistics'],
        postedBy: defaultUser._id,
        status: 'active'
      }
    ];

    await Job.insertMany(jobs);
    console.log(`Seeded ${jobs.length} jobs`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs();
