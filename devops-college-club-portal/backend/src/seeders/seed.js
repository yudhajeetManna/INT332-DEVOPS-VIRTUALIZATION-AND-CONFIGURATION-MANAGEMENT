require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Club, Event, Membership, Attendance, Notification } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Drops and recreates all tables
    console.log('🌱 Database synced');

    // --- Users ---
    const passwordHash = await bcrypt.hash('password123', 12);
    const adminHash = await bcrypt.hash('admin123', 12);

    const admin = await User.create({ name: 'Admin User', email: 'admin@college.edu', password_hash: adminHash, role: 'admin' });
    const leader1 = await User.create({ name: 'Priya Sharma', email: 'priya@college.edu', password_hash: passwordHash, role: 'leader' });
    const leader2 = await User.create({ name: 'Rahul Verma', email: 'rahul@college.edu', password_hash: passwordHash, role: 'leader' });
    const student1 = await User.create({ name: 'Ankit Kumar', email: 'ankit@college.edu', password_hash: passwordHash, role: 'student' });
    const student2 = await User.create({ name: 'Sneha Patel', email: 'sneha@college.edu', password_hash: passwordHash, role: 'student' });
    const student3 = await User.create({ name: 'Dev Mehta', email: 'dev@college.edu', password_hash: passwordHash, role: 'student' });
    console.log('✅ Users created');

    // --- Clubs ---
    const techClub = await Club.create({ club_name: 'Tech Innovators', category: 'Technology', description: 'Coding, hackathons, and tech talks', leader_id: leader1.id });
    const artClub = await Club.create({ club_name: 'Creative Arts', category: 'Arts', description: 'Painting, sketching, and digital art', leader_id: leader2.id });
    const sportsClub = await Club.create({ club_name: 'Sports Arena', category: 'Sports', description: 'Football, cricket, and badminton', leader_id: null });
    
    // New Clubs
    const musicClub = await Club.create({ club_name: 'Symphony Music Club', category: 'Music', description: 'Vocal, instrumental, and band performances', leader_id: null });
    const photoClub = await Club.create({ club_name: 'Lens & Light', category: 'Photography', description: 'Photography walks, editing workshops, and exhibitions', leader_id: null });
    const litClub = await Club.create({ club_name: 'The Page Turners', category: 'Literature', description: 'Book discussions, poetry slams, and creative writing', leader_id: null });
    const dramaClub = await Club.create({ club_name: 'Curtain Call', category: 'Drama', description: 'Stage plays, street plays, and acting workshops', leader_id: null });
    const ecell = await Club.create({ club_name: 'Entrepreneurship Cell', category: 'Business', description: 'Startup networking, pitch decks, and business modeling', leader_id: null });
    const socialClub = await Club.create({ club_name: 'Helping Hands', category: 'Social Service', description: 'Community service, teaching drives, and clean-up campaigns', leader_id: null });
    const danceClub = await Club.create({ club_name: 'Rhythm Dancers', category: 'Dance', description: 'Classical, western, and contemporary dance forms', leader_id: null });
    
    console.log('✅ Clubs created');

    // --- Events ---
    const event1 = await Event.create({ title: 'Hackathon 2024', venue: 'Lab Block A', event_date: new Date('2024-12-15'), club_id: techClub.club_id, created_by: leader1.id, description: '24-hour coding competition' });
    const event2 = await Event.create({ title: 'Art Exhibition', venue: 'Main Hall', event_date: new Date('2024-12-20'), club_id: artClub.club_id, created_by: leader2.id, description: 'Annual art showcase' });
    const event3 = await Event.create({ title: 'Tech Talk: AI & ML', venue: 'Seminar Room 3', event_date: new Date('2024-11-30'), club_id: techClub.club_id, created_by: leader1.id, description: 'Guest lecture on AI trends' });
    console.log('✅ Events created');

    // --- Memberships ---
    await Membership.create({ student_id: student1.id, club_id: techClub.club_id, status: 'approved' });
    await Membership.create({ student_id: student2.id, club_id: techClub.club_id, status: 'approved' });
    await Membership.create({ student_id: student3.id, club_id: artClub.club_id, status: 'approved' });
    await Membership.create({ student_id: student1.id, club_id: artClub.club_id, status: 'pending' });
    console.log('✅ Memberships created');

    // --- Attendance ---
    await Attendance.create({ student_id: student1.id, event_id: event1.event_id, status: 'present' });
    await Attendance.create({ student_id: student2.id, event_id: event1.event_id, status: 'present' });
    await Attendance.create({ student_id: student3.id, event_id: event2.event_id, status: 'present' });
    console.log('✅ Attendance created');

    // --- Notifications ---
    await Notification.create({ user_id: student1.id, message: 'Welcome to College Club Portal!', is_read: false });
    await Notification.create({ user_id: student1.id, message: 'Your Tech Innovators membership is approved!', is_read: false });
    await Notification.create({ user_id: leader1.id, message: 'New join request for Tech Innovators', is_read: false });
    console.log('✅ Notifications created');

    console.log('\n🎉 Seed complete! Default credentials:');
    console.log('   Admin:   admin@college.edu   / admin123');
    console.log('   Leader:  priya@college.edu   / password123');
    console.log('   Leader:  rahul@college.edu   / password123');
    console.log('   Student: ankit@college.edu   / password123');
    console.log('   Student: sneha@college.edu   / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
