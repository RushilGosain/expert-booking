const Expert = require('../models/Expert');

// GET /experts
exports.getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 9, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    const [experts, total] = await Promise.all([
      Expert.find(filter, '-timeSlots').skip(skip).limit(parseInt(limit)).sort({ rating: -1 }),
      Expert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: experts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET /experts/:id
exports.getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });

    res.json({ success: true, data: expert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Seed route for development
exports.seedExperts = async (req, res) => {
  try {
    await Expert.deleteMany({});
    const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health'];
    const names = [
      'Aria Chen', 'Marcus Webb', 'Priya Nair', 'James Holloway', 'Sofia Reyes',
      'David Park', 'Nadia Okonkwo', 'Liam Foster', 'Yuki Tanaka', 'Elena Vasquez',
      'Omar Khalid', 'Isabelle Morel',
    ];

    const today = new Date();
    const generateSlots = () => {
      const slots = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const times = [
          ['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'],
          ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00'],
        ];
        times.forEach(([start, end]) => {
          slots.push({ date: dateStr, startTime: start, endTime: end, isBooked: false });
        });
      }
      return slots;
    };

    const experts = names.map((name, i) => ({
      name,
      category: categories[i % categories.length],
      experience: Math.floor(Math.random() * 15) + 2,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 200) + 10,
      hourlyRate: [80, 100, 120, 150, 200][Math.floor(Math.random() * 5)],
      bio: `${name} is a seasoned expert with deep expertise in their field, helping clients achieve breakthrough results.`,
      skills: ['Strategy', 'Consulting', 'Problem Solving', 'Leadership'].slice(0, Math.floor(Math.random() * 3) + 2),
      timeSlots: generateSlots(),
    }));

    await Expert.insertMany(experts);
    res.json({ success: true, message: `Seeded ${experts.length} experts` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};