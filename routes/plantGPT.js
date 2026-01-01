const express = require('express');
const router = express.Router();

// Plant GPT main page - for customers
router.get('/plant-gpt', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  
  res.render('customer/plant-gpt', {
    title: 'Plant GPT - AI Care Assistant',
    user: req.session.user,
    role: req.session.user.role
  });
});

// Smart Plant Care Chatbot
router.post('/plant-gpt/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.json({ response: "Please ask a question about plants!" });
    }

    console.log('🤖 PlantGPT Question:', message);

    // Enhanced plant knowledge database
    const plantKnowledge = {
      // Watering questions
      'water': "💧 **Watering Guide:** Most plants prefer when the top 1-2 inches of soil dry out between waterings. Stick your finger in the soil to test! Overwatering is the #1 plant killer.",
      'how often water': "💧 **Watering Frequency:** It depends on the plant type: Succulents (every 2-3 weeks), Tropical plants (weekly), Most houseplants (when top soil is dry). Always check soil moisture first!",
      'overwater': "🚫 **Overwatering Signs:** Yellow leaves, mushy stems, moldy soil. Solution: Let soil dry completely, improve drainage, remove affected leaves.",
      'underwater': "🏜️ **Underwatering Signs:** Dry crispy leaves, drooping, soil pulling from pot edges. Solution: Water thoroughly until it drains out bottom.",
      
      // Plant recommendations
      'which plant': "🏡 **Best Indoor Plants:** Snake Plant (low light), Pothos (easy care), Spider Plant (pet-safe), Peace Lily (blooms indoors), ZZ Plant (neglect-tolerant).",
      'home plant': "🌿 **Home-Friendly Plants:** For beginners: Snake Plant, Pothos, Spider Plant. For low light: ZZ Plant, Chinese Evergreen. For air purification: Peace Lily, Boston Fern.",
      'indoor plant': "🪴 **Top Indoor Plants:** 1. Snake Plant - thrives on neglect, 2. Pothos - grows anywhere, 3. Spider Plant - purifies air, 4. Peace Lily - shows when thirsty, 5. ZZ Plant - low light champion!",
      'beginner plant': "🌱 **Beginner-Friendly:** Start with Snake Plant, Pothos, Spider Plant, or ZZ Plant. They're forgiving and easy to care for!",
      'low light plant': "💡 **Low Light Plants:** Snake Plant, ZZ Plant, Pothos, Chinese Evergreen, Peace Lily, Philodendron. Perfect for rooms with north-facing windows!",
      
      // Plant problems
      'yellow': "🍂 **Yellow Leaves Solution:** Usually means overwatering! Check soil moisture. Let soil dry between waterings. Could also be nutrient deficiency or natural shedding.",
      'brown': "🔴 **Brown Tips/Edges:** Caused by low humidity, underwatering, or fertilizer burn. Increase humidity, water consistently, flush soil occasionally.",
      'droop': "😴 **Drooping Plants:** Could be underwatering (dry soil) or overwatering (soggy soil). Check soil and adjust watering. Might need more light.",
      'die': "😢 **Reviving Plants:** Check roots for rot, ensure proper drainage, adjust light. Repot with fresh soil if needed. Trim dead leaves.",
      
      // Specific plant care
      'succulent': "🌵 **Succulent Care:** Bright direct light, infrequent watering (every 2-3 weeks), excellent drainage. Use succulent/cactus mix.",
      'orchid': "🌸 **Orchid Care:** Bright indirect light, water once weekly, use orchid bark mix. Keep in stable temperature away from drafts.",
      'rose': "🌹 **Rose Care:** Full sun (6+ hours daily), well-draining soil, regular watering. Prune in early spring, fertilize during growing season.",
      'bonsai': "🎋 **Bonsai Care:** Bright indirect light, consistent watering (don't let dry completely), regular pruning. Use bonsai-specific soil.",
      
      // General care
      'soil': "🟫 **Soil Tips:** Well-draining potting mix is essential. Add perlite for drainage. Most plants hate soggy soil!",
      'fertiliz': "🌿 **Fertilizing:** Use balanced liquid fertilizer every 2-4 weeks in spring/summer. Reduce in fall/winter. Don't over-fertilize!",
      'sunlight': "☀️ **Light Requirements:** Bright indirect light is ideal. South/east windows are best. Direct sun can scorch leaves.",
      'repot': "🪴 **Repotting:** Do in spring, pot 2 inches larger. Water thoroughly after. Refresh soil annually.",
      'propagat': "✂️ **Propagation:** Many plants grow from cuttings in water or soil. Try with Pothos, Spider Plant, or Snake Plant!",
      
      // Pest control
      'bug': "🐛 **Pest Control:** For aphids/spider mites, use neem oil or insecticidal soap. Isolate affected plants. Wipe leaves regularly.",
      'fungus': "🍄 **Fungus Issues:** Improve air circulation, reduce watering, remove affected parts. Use fungicide if severe."
    };

    const lowerMessage = message.toLowerCase();
    let response = "";
    let foundMatch = false;

    // Smart keyword matching with priority
    const keywordPriority = [
      'how often water', 'overwater', 'underwater',
      'which plant', 'home plant', 'indoor plant', 'beginner plant', 'low light plant',
      'yellow', 'brown', 'droop', 'die',
      'succulent', 'orchid', 'rose', 'bonsai',
      'water', 'soil', 'fertiliz', 'sunlight', 'repot', 'propagat',
      'bug', 'fungus'
    ];

    // Check high-priority phrases first
    for (const keyword of keywordPriority) {
      if (lowerMessage.includes(keyword)) {
        response = plantKnowledge[keyword];
        foundMatch = true;
        console.log('🤖 Matched keyword:', keyword);
        break;
      }
    }

    // If no specific match, try general matching
    if (!foundMatch) {
      for (const [keyword, advice] of Object.entries(plantKnowledge)) {
        if (lowerMessage.includes(keyword)) {
          response = advice;
          foundMatch = true;
          console.log('🤖 Matched general keyword:', keyword);
          break;
        }
      }
    }

    // Smart responses for common questions
    if (!foundMatch) {
      if (lowerMessage.includes('good') && lowerMessage.includes('plant')) {
        response = "🏡 **Best Home Plants:** Snake Plant (low maintenance), Pothos (versatile), Peace Lily (blooms + air purifying), Spider Plant (pet-safe), ZZ Plant (low light tolerant). All are beginner-friendly!";
      } else if ((lowerMessage.includes('keep') || lowerMessage.includes('grow')) && lowerMessage.includes('home')) {
        response = "🌿 **Easy Home Plants:** Snake Plant, Pothos, Spider Plant, ZZ Plant, Peace Lily. These adapt well to indoor conditions and are perfect for beginners!";
      } else if (lowerMessage.includes('suitable') || lowerMessage.includes('recommend')) {
        response = "🪴 **Plant Recommendations:** For low light: Snake Plant, ZZ Plant. For easy care: Pothos, Spider Plant. For air purification: Peace Lily, Boston Fern. For beginners: all of the above!";
      } else if (lowerMessage.includes('care') || lowerMessage.includes('tip')) {
        response = "💡 **Essential Plant Care:** 1. Right light for plant type, 2. Water when soil is dry, 3. Use well-draining soil, 4. Fertilize in growing season, 5. Watch for pests regularly.";
      } else {
        // General helpful response
        response = "🌱 **Plant Care Assistant:** I can help with plant care advice! Try asking about:\n• Watering schedules\n• Plant recommendations\n• Problem diagnosis (yellow leaves, pests)\n• Specific plant care (succulents, orchids, etc.)\n• Light and soil requirements";
      }
    }

    res.json({ response });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      response: "🌱 **Plant Care Tip:** When in doubt, check the basics - proper light, appropriate watering, and good drainage solve most plant problems! Try asking about specific plant issues or care requirements." 
    });
  }
});

module.exports = router;