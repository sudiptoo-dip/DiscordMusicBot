require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

// .env ফাইল থেকে টোকেনগুলো নিয়ে অ্যারে তৈরি করা
const tokens = process.env.TOKENS ? process.env.TOKENS.split(',') : [];

if (tokens.length === 0) {
    console.error("❌ No tokens found! Please check your .env file.");
    process.exit(1);
}

console.log(`🚀 Starting bot for ${tokens.length} account(s)...`);

// প্রতিটি টোকেনের জন্য আলাদা ক্লায়েন্ট তৈরি করা
tokens.forEach((token, index) => {
    const client = new Client({ 
        checkUpdate: false 
    });

    client.on('ready', () => {
        console.log(`✅ [Account ${index + 1}] Logged in as: ${client.user.tag}`);

        // features ফোল্ডার স্ক্যান করা
        const featuresPath = path.join(__dirname, 'features');
        
        // যদি ফোল্ডার না থাকে তবে তৈরি করবে (এরর হ্যান্ডলিং)
        if (!fs.existsSync(featuresPath)) {
            fs.mkdirSync(featuresPath);
        }

        const featureFiles = fs.readdirSync(featuresPath).filter(file => file.endsWith('.js'));

        // প্রতিটি ফিচার ফাইল অটোমেটিক লোড এবং রান করা
        featureFiles.forEach(file => {
            try {
                // ফাইল রিকোয়ার করার আগে ক্যাশ ক্লিয়ার করা (ডেভেলপমেন্টে সুবিধা দেয়)
                delete require.cache[require.resolve(path.join(featuresPath, file))];
                const feature = require(path.join(featuresPath, file));

                if (typeof feature === 'function') {
                    feature(client);
                }
            } catch (error) {
                console.error(`❌ Error loading feature ${file} for ${client.user.tag}:`, error);
            }
        });
    });

    // টোকেন লগিন (অতিরিক্ত স্পেস রিমুভ করে)
    client.login(token.trim()).catch(err => {
        console.error(`❌ [Account ${index + 1}] Login failed: ${err.message}`);
    });
});
