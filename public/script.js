// Enhanced Application State Management
let applicationState = {
  currentMood: null,
  moodHistory: JSON.parse(localStorage.getItem("moodHistory")) || [],
  quotesData: [],
  newsData: [],
  weatherData: null,
  userLocation: null,
  currentFilters: {
    quotes: "all",
    news: "mental health",
  },
  searchQuery: "",
  sortBy: "relevance",
  apiStatus: {
    quotes: "loading",
    weather: "loading",
    news: "loading",
  },
};

// Enhanced initialization
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🌱 MindfulMe Advanced - Loading with external APIs...");
  showNotification(
    "Welcome to MindfulMe! Loading real-time data from multiple external APIs...",
    "info"
  );

  await initializeAdvancedApp();
  updateMoodStats();
  updateWellnessProgress();
});

async function initializeAdvancedApp() {
  try {
    // Load all external API data with enhanced error handling
    const loadPromises = [
      loadAdvancedQuotes().catch((err) =>
        console.warn("Quotes API issue:", err)
      ),
      loadAdvancedWeather().catch((err) =>
        console.warn("Weather API issue:", err)
      ),
      loadAdvancedNews().catch((err) => console.warn("News API issue:", err)),
    ];

    await Promise.allSettled(loadPromises);

    console.log("✅ Advanced application initialized with external APIs");
    showNotification("All external APIs loaded successfully! 🎉", "success");
  } catch (error) {
    console.error("❌ Advanced app initialization error:", error);
    showNotification(
      "Some external APIs are temporarily unavailable. Using fallback data.",
      "warning"
    );
  }
}

// EXTERNAL API 1: Enhanced Quotable API Integration
async function loadAdvancedQuotes() {
  try {
    updateAPIStatus("quotesStatus", "loading");
    console.log(
      "🔄 Loading quotes from Quotable API with advanced filtering..."
    );

    const response = await fetch(
      "/api/quotes?tags=motivational,inspirational,wisdom,success&limit=20"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      applicationState.quotesData = data.data;
      displayAdvancedQuote(getPersonalizedQuote());
      updateAPIStatus("quotesStatus", "success");
      updateAPISource(
        "quoteSource",
        `✅ ${data.source} - ${data.data.length} quotes loaded`
      );
      console.log(`✅ Loaded ${data.data.length} quotes from ${data.source}`);
    } else {
      throw new Error("No quote data received from external API");
    }
  } catch (error) {
    console.error("❌ Quotable API error:", error);
    updateAPIStatus("quotesStatus", "error");
    showAdvancedQuoteFallback();
    updateAPISource(
      "quoteSource",
      "⚠️ External API unavailable - Using fallback data"
    );
  }
}

function getPersonalizedQuote() {
  if (
    !applicationState.quotesData ||
    applicationState.quotesData.length === 0
  ) {
    return getFallbackQuote();
  }

  let filteredQuotes = applicationState.quotesData;

  // Apply current filter
  if (applicationState.currentFilters.quotes !== "all") {
    if (
      applicationState.currentFilters.quotes === "mood-match" &&
      applicationState.currentMood
    ) {
      // Match quotes to current mood
      const moodTags = {
        amazing: ["success", "motivational", "inspirational"],
        good: ["motivational", "wisdom", "success"],
        okay: ["wisdom", "motivational"],
        down: ["inspirational", "wisdom"],
        anxious: ["wisdom", "inspirational"],
      };

      const relevantTags = moodTags[applicationState.currentMood.mood] || [
        "motivational",
      ];
      filteredQuotes = applicationState.quotesData.filter(
        (quote) =>
          quote.tags && quote.tags.some((tag) => relevantTags.includes(tag))
      );
    } else {
      filteredQuotes = applicationState.quotesData.filter(
        (quote) =>
          quote.tags &&
          quote.tags.includes(applicationState.currentFilters.quotes)
      );
    }
  }

  // Apply search filter
  if (applicationState.searchQuery) {
    filteredQuotes = filteredQuotes.filter(
      (quote) =>
        quote.content
          .toLowerCase()
          .includes(applicationState.searchQuery.toLowerCase()) ||
        quote.author
          .toLowerCase()
          .includes(applicationState.searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  switch (applicationState.sortBy) {
    case "alphabetical":
      filteredQuotes.sort((a, b) => a.content.localeCompare(b.content));
      break;
    case "mood-correlation":
      if (applicationState.currentMood) {
        // Prioritize quotes that match current mood
        filteredQuotes.sort((a, b) => {
          const aRelevant = a.tags && a.tags.includes("motivational") ? 1 : 0;
          const bRelevant = b.tags && b.tags.includes("motivational") ? 1 : 0;
          return bRelevant - aRelevant;
        });
      }
      break;
    default:
      // Keep original order for relevance
      break;
  }

  if (filteredQuotes.length === 0) {
    filteredQuotes = applicationState.quotesData;
  }

  return filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
}

function getFallbackQuote() {
  const fallbackQuotes = [
    {
      content:
        "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives.",
      author: "William James",
      tags: ["psychology", "motivational"],
    },
    {
      content:
        "What mental health needs is more sunlight, more candor, and more unashamed conversation.",
      author: "Glenn Close",
      tags: ["mental-health", "awareness"],
    },
  ];

  return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
}

function displayAdvancedQuote(quote) {
  const quoteContent = document.getElementById("quoteContent");
  const tags = quote.tags
    ? quote.tags.map((tag) => `<span class="data-tag">${tag}</span>`).join("")
    : "";

  quoteContent.innerHTML = `
                <div class="quote-text">"${quote.content}"</div>
                <div class="quote-author">— ${quote.author}</div>
                <div class="data-tags" style="margin-top: 1rem;">
                    ${tags}
                </div>
            `;
}

function showAdvancedQuoteFallback() {
  displayAdvancedQuote(getFallbackQuote());
}

async function getNewQuote() {
  const btn = document.getElementById("newQuoteBtn");
  btn.disabled = true;
  btn.textContent = "🔄 Loading...";

  try {
    displayAdvancedQuote(getPersonalizedQuote());
    showNotification("New personalized quote loaded! ✨", "success");
  } catch (error) {
    showNotification("Using fallback quote data", "warning");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 Get New Quote";
  }
}

// EXTERNAL API 2: Enhanced Weather Integration
async function loadAdvancedWeather() {
  try {
    updateAPIStatus("weatherStatus", "loading");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          applicationState.userLocation = { lat: latitude, lon: longitude };
          await fetchAdvancedWeatherData(latitude, longitude);
        },
        (error) => {
          console.log(
            "📍 Location access denied, using NYC coordinates for demo"
          );
          fetchAdvancedWeatherData(40.7128, -74.006);
        },
        { timeout: 10000 }
      );
    } else {
      console.log("🌍 Geolocation not supported, using demo coordinates");
      fetchAdvancedWeatherData(40.7128, -74.006);
    }
  } catch (error) {
    console.error("🌤️ Weather initialization error:", error);
    updateAPIStatus("weatherStatus", "error");
    showAdvancedWeatherFallback();
  }
}

async function fetchAdvancedWeatherData(lat, lon) {
  try {
    console.log(
      `🔄 Fetching weather from OpenWeatherMap API for ${lat.toFixed(
        4
      )}, ${lon.toFixed(4)}...`
    );

    const response = await fetch(`/api/weather/${lat}/${lon}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      applicationState.weatherData = data.data;
      displayAdvancedWeatherData(data.data);
      updateAPIStatus(
        "weatherStatus",
        data.source.includes("External") ||
          data.source.includes("OpenWeatherMap")
          ? "success"
          : "warning"
      );
      updateAPISource(
        "weatherSource",
        `${
          data.source.includes("External") ||
          data.source.includes("OpenWeatherMap")
            ? "✅"
            : "⚠️"
        } ${data.source}`
      );
      console.log(`✅ Weather data loaded from ${data.source}`);
    } else {
      throw new Error("Invalid weather data from external API");
    }
  } catch (error) {
    console.error("❌ OpenWeatherMap API error:", error);
    updateAPIStatus("weatherStatus", "error");
    showAdvancedWeatherFallback();
  }
}

function displayAdvancedWeatherData(data) {
  const weatherContent = document.getElementById("weatherContent");
  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const emoji = getWeatherEmoji(data.weather[0].main);
  const humidity = data.main.humidity;
  const windSpeed = data.wind ? Math.round(data.wind.speed) : 0;

  const moodImpact = getAdvancedWeatherMoodImpact(
    data.weather[0].main,
    temp,
    humidity
  );

  weatherContent.innerHTML = `
                <div class="weather-display">
                    <div class="weather-icon">${emoji}</div>
                    <div class="weather-info">
                        <h4>${data.name}</h4>
                        <div class="weather-temp">${temp}°F</div>
                        <div class="weather-desc">${description}</div>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${humidity}%</div>
                        <div class="stat-label">Humidity</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${windSpeed}</div>
                        <div class="stat-label">Wind MPH</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${moodImpact.moodScore}/5</div>
                        <div class="stat-label">Mood Impact</div>
                    </div>
                </div>
                
                <div class="mood-insight">
                    <h4>🧠 AI Weather-Mood Analysis</h4>
                    <p><strong>${moodImpact.message}</strong></p>
                    <div class="insight-tips">
                        <p><strong>Personalized Recommendations:</strong></p>
                        <ul>
                            ${moodImpact.tips
                              .map((tip) => `<li>${tip}</li>`)
                              .join("")}
                        </ul>
                    </div>
                </div>
            `;
}

function getWeatherEmoji(condition) {
  const emojis = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Snow: "❄️",
    Thunderstorm: "⛈️",
    Drizzle: "🌦️",
    Mist: "🌫️",
    Fog: "🌫️",
  };
  return emojis[condition] || "🌤️";
}

function getAdvancedWeatherMoodImpact(condition, temp, humidity) {
  const impacts = {
    Clear: {
      message:
        "Sunny weather naturally boosts serotonin and vitamin D production!",
      tips: [
        "Take advantage of natural light for outdoor activities",
        "Practice sun-gazing meditation (safely, for short periods)",
        "Consider a nature walk to enhance mood benefits",
        "Open windows to increase fresh air circulation",
      ],
      moodScore: 5,
    },
    Clouds: {
      message:
        "Overcast conditions can affect circadian rhythms, but offer perfect ambiance for introspection.",
      tips: [
        "Use bright indoor lighting to compensate for reduced sunlight",
        "Practice gratitude exercises to boost mood naturally",
        "Consider light therapy if feeling low energy",
        "Focus on cozy indoor activities that bring joy",
      ],
      moodScore: 3,
    },
    Rain: {
      message:
        "Rain creates negative ions that can reduce stress and increase mental clarity.",
      tips: [
        "Listen to rain sounds for natural stress relief",
        "Practice mindfulness while observing raindrops",
        "Stay hydrated as rainy weather can affect mood",
        "Use this time for reflective journaling or reading",
      ],
      moodScore: 3,
    },
    Snow: {
      message:
        "Snow can create a peaceful, meditative environment that promotes calm.",
      tips: [
        "Embrace the quiet beauty and practice snow meditation",
        "Ensure adequate vitamin D intake during snowy periods",
        "Stay warm and cozy to maintain positive mood",
        "Use winter light therapy if available",
      ],
      moodScore: 4,
    },
  };

  const impact = impacts[condition] || {
    message:
      "Every weather condition offers unique opportunities for mindfulness and mood enhancement.",
    tips: [
      "Stay present and find beauty in today's weather",
      "Practice acceptance of conditions beyond your control",
      "Focus on indoor comfort and self-care activities",
    ],
    moodScore: 3,
  };

  // Adjust mood score based on temperature and humidity
  if (temp >= 70 && temp <= 80) impact.moodScore += 0.5;
  if (humidity >= 40 && humidity <= 60) impact.moodScore += 0.5;

  impact.moodScore = Math.min(5, Math.max(1, impact.moodScore));

  return impact;
}

function showAdvancedWeatherFallback() {
  const weatherContent = document.getElementById("weatherContent");
  weatherContent.innerHTML = `
                <div class="weather-display">
                    <div class="weather-icon">🌤️</div>
                    <div class="weather-info">
                        <h4>Weather Service</h4>
                        <div class="weather-temp">--°F</div>
                        <div class="weather-desc">External API Unavailable</div>
                    </div>
                </div>
                <div class="mood-insight">
                    <h4>🧠 Weather & Mood Science</h4>
                    <p>Weather significantly impacts mental health through circadian rhythms, vitamin D production, and atmospheric pressure changes.</p>
                    <div class="insight-tips">
                        <ul>
                            <li>Maintain consistent light exposure for circadian health</li>
                            <li>Practice weather-independent mood regulation techniques</li>
                            <li>Use light therapy during overcast or winter periods</li>
                        </ul>
                    </div>
                </div>
            `;
  updateAPISource(
    "weatherSource",
    "⚠️ External API unavailable - Weather science info provided"
  );
}

async function getWeatherInsights() {
  const btn = document.getElementById("weatherBtn");
  btn.disabled = true;
  btn.textContent = "📍 Analyzing...";

  try {
    if (applicationState.userLocation) {
      await fetchAdvancedWeatherData(
        applicationState.userLocation.lat,
        applicationState.userLocation.lon
      );
    } else {
      await loadAdvancedWeather();
    }
    showNotification("Weather mood analysis updated! 🌤️", "success");
  } catch (error) {
    showNotification("Unable to load weather data from external API", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "📍 Update Weather Analysis";
  }
}

// EXTERNAL API 3: Enhanced News Integration
async function loadAdvancedNews() {
  try {
    updateAPIStatus("newsStatus", "loading");
    console.log("🔄 Loading mental health news from NewsAPI...");

    const category = applicationState.currentFilters.news;
    const response = await fetch(
      `/api/news/${encodeURIComponent(category)}?limit=8`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.articles && data.articles.length > 0) {
      applicationState.newsData = data.articles;
      displayAdvancedNews(data.articles);
      updateAPIStatus(
        "newsStatus",
        data.source.includes("External") || data.source.includes("NewsAPI")
          ? "success"
          : "warning"
      );
      updateAPISource(
        "newsSource",
        `${
          data.source.includes("External") || data.source.includes("NewsAPI")
            ? "✅"
            : "⚠️"
        } ${data.source} - ${data.articles.length} articles`
      );
      console.log(
        `✅ Loaded ${data.articles.length} articles from ${data.source}`
      );
    } else {
      throw new Error("No news data received from external API");
    }
  } catch (error) {
    console.error("❌ NewsAPI error:", error);
    updateAPIStatus("newsStatus", "error");
    showAdvancedNewsFallback();
    updateAPISource(
      "newsSource",
      "⚠️ External API unavailable - Using curated content"
    );
  }
}

function displayAdvancedNews(articles) {
  const newsContent = document.getElementById("newsContent");

  if (!articles || articles.length === 0) {
    newsContent.innerHTML =
      '<p class="info-message">No articles found for the current filter. Try a different category!</p>';
    return;
  }

  let filteredArticles = [...articles];

  // Apply search filter
  if (applicationState.searchQuery) {
    filteredArticles = filteredArticles.filter(
      (article) =>
        article.title
          .toLowerCase()
          .includes(applicationState.searchQuery.toLowerCase()) ||
        (article.description &&
          article.description
            .toLowerCase()
            .includes(applicationState.searchQuery.toLowerCase()))
    );
  }

  // Apply sorting
  switch (applicationState.sortBy) {
    case "date":
      filteredArticles.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );
      break;
    case "alphabetical":
      filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "mood-correlation":
      if (applicationState.currentMood) {
        // Prioritize articles that might help with current mood
        filteredArticles.sort((a, b) => {
          const aRelevant =
            a.title.toLowerCase().includes("wellness") ||
            a.title.toLowerCase().includes("positive")
              ? 1
              : 0;
          const bRelevant =
            b.title.toLowerCase().includes("wellness") ||
            b.title.toLowerCase().includes("positive")
              ? 1
              : 0;
          return bRelevant - aRelevant;
        });
      }
      break;
  }

  newsContent.innerHTML = `
                <div class="data-grid">
                    ${filteredArticles
                      .slice(0, 6)
                      .map(
                        (article) => `
                        <div class="data-item" onclick="openAdvancedArticle('${
                          article.url || "#"
                        }', '${article.title}')">
                            <div class="data-title">${article.title}</div>
                            <div class="data-meta">
                                <span>📰 ${article.source.name}</span>
                                <span>🕒 ${formatAdvancedDate(
                                  article.publishedAt
                                )}</span>
                            </div>
                            ${
                              article.description
                                ? `<div class="data-description">${article.description}</div>`
                                : ""
                            }
                            <div class="data-tags">
                                <div class="data-tag">${
                                  applicationState.currentFilters.news
                                }</div>
                                <div class="data-tag">External API</div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;

  if (filteredArticles.length === 0) {
    newsContent.innerHTML =
      '<p class="warning-message">No articles match your current search. Try adjusting your filters or search terms.</p>';
  }
}

function showAdvancedNewsFallback() {
  const fallbackArticles = [
    {
      title: "Mental Health Awareness: Breaking the Stigma Through Technology",
      description:
        "How digital platforms are revolutionizing mental health support and making therapy more accessible to everyone.",
      source: { name: "Curated Health Tech News" },
      publishedAt: new Date().toISOString(),
      url: "#",
    },
    {
      title: "The Science of Happiness: New Research on Well-being",
      description:
        "Recent scientific discoveries about what truly contributes to human happiness and psychological resilience.",
      source: { name: "Curated Psychology Research" },
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      url: "#",
    },
  ];

  displayAdvancedNews(fallbackArticles);
}

async function refreshNews() {
  const btn = document.getElementById("newsBtn");
  btn.disabled = true;
  btn.textContent = "🔄 Loading...";

  try {
    await loadAdvancedNews();
    showNotification(
      "Mental health insights updated from external API! 📰",
      "success"
    );
  } catch (error) {
    showNotification("Unable to load news from external API", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔄 Refresh Insights";
  }
}

// Enhanced Mood Tracking with Analytics
function selectMood(emoji, mood, score) {
  // Visual feedback
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });

  event.target.classList.add("selected");

  // Update application state
  applicationState.currentMood = {
    emoji,
    mood,
    score,
    date: new Date().toDateString(),
    timestamp: Date.now(),
    weatherCorrelation: applicationState.weatherData
      ? {
          condition: applicationState.weatherData.weather[0].main,
          temp: applicationState.weatherData.main.temp,
        }
      : null,
  };

  // Save and analyze
  saveMoodWithAnalytics();
  logMoodToAdvancedAPI(mood, score);
  showAdvancedMoodInsight(mood, score);
  updateMoodStats();
  updateWellnessProgress();
}

function saveMoodWithAnalytics() {
  // Remove existing mood for today
  applicationState.moodHistory = applicationState.moodHistory.filter(
    (entry) => entry.date !== applicationState.currentMood.date
  );

  // Add current mood
  applicationState.moodHistory.push(applicationState.currentMood);

  // Keep last 90 days for better analytics
  if (applicationState.moodHistory.length > 90) {
    applicationState.moodHistory = applicationState.moodHistory.slice(-90);
  }

  localStorage.setItem(
    "moodHistory",
    JSON.stringify(applicationState.moodHistory)
  );
}

async function logMoodToAdvancedAPI(mood, score) {
  try {
    const response = await fetch("/api/mood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mood,
        score,
        timestamp: new Date().toISOString(),
        context: {
          weather: applicationState.weatherData
            ? applicationState.weatherData.weather[0].main
            : null,
          hasSearched: applicationState.searchQuery.length > 0,
          activeFilters: applicationState.currentFilters,
        },
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Advanced mood logged to API with context");
    } else {
      console.warn("⚠️ Mood API response:", data.message);
    }
  } catch (error) {
    console.error("❌ Advanced mood API error:", error);
  }
}

function showAdvancedMoodInsight(mood, score) {
  const insights = {
    amazing: {
      message: "Outstanding! You're experiencing peak emotional wellness! ✨",
      tips: [
        "Document what's contributing to this amazing feeling in a gratitude journal",
        "Share your positive energy with others - consider volunteering or helping someone",
        "Use this high-energy state to tackle challenging personal goals",
        "Practice loving-kindness meditation to extend these feelings",
        "Consider what habits or activities led to this state for future reference",
      ],
      color: "#00b894",
      aiRecommendation:
        "Your mood pattern suggests you thrive with social connection and achievement. Consider scheduling more collaborative activities.",
    },
    good: {
      message:
        "Excellent! You're in a positive, productive headspace today! 😊",
      tips: [
        "This is an ideal time for important conversations or decisions",
        "Practice mindfulness to fully appreciate and extend these good feelings",
        "Connect with friends or family who matter to you",
        "Take on creative projects or learn something new",
        "Use this stable mood to build healthy routine habits",
      ],
      color: "#74b9ff",
      aiRecommendation:
        "Your consistent positive moods indicate strong emotional regulation. Keep maintaining your current wellness practices.",
    },
    okay: {
      message:
        "That's completely normal and valid. Neutral days are part of a healthy emotional spectrum. 💙",
      tips: [
        "Practice radical self-acceptance - 'okay' is perfectly fine",
        "Try gentle movement like stretching or a short walk",
        "Engage in a small act of self-care that usually brings comfort",
        "Connect with nature, even if just observing from a window",
        "Remember that emotions are temporary and will naturally shift",
      ],
      color: "#fdcb6e",
      aiRecommendation:
        "Your mood data shows resilience. Consider incorporating more variety in your daily routine to prevent emotional flatness.",
    },
    down: {
      message:
        "I recognize you're going through a difficult time. Your feelings are completely valid. 🤗",
      tips: [
        "Reach out to your support network - you don't have to face this alone",
        "Practice the RAIN technique: Recognize, Allow, Investigate, Nurture",
        "Engage in gentle, nurturing activities like warm baths or soft music",
        "Consider professional support if these feelings persist or worsen",
        "Remember: this is temporary, and you have survived difficult times before",
        "Focus on basic self-care: nutrition, hydration, rest",
      ],
      color: "#e17055",
      aiRecommendation:
        "Your mood history shows you typically recover well. Consider reaching out to your support system and practicing extra self-compassion today.",
    },
    anxious: {
      message:
        "Anxiety is your mind trying to protect you, but you have tools to manage it. 🌸",
      tips: [
        "Try the 4-7-8 breathing technique: inhale 4, hold 7, exhale 8 counts",
        "Ground yourself with the 5-4-3-2-1 technique: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
        "Practice progressive muscle relaxation from head to toe",
        "Limit caffeine and sugar, which can exacerbate anxiety",
        "Consider speaking with a mental health professional for ongoing support",
        "Remember: anxiety is temporary and you are stronger than your worries",
      ],
      color: "#a29bfe",
      aiRecommendation:
        "Your anxiety patterns suggest certain triggers. Consider keeping an anxiety journal to identify patterns and develop personalized coping strategies.",
    },
  };

  const insight = insights[mood] || insights.okay;
  const insightDiv = document.getElementById("moodInsight");

  // Calculate mood streak and trend for personalized message
  const streak = calculateMoodStreak();
  const trend = calculateMoodTrend();

  insightDiv.innerHTML = `
                <div class="mood-insight" style="border-left-color: ${
                  insight.color
                }">
                    <h4>🧠 AI-Powered Mood Analysis</h4>
                    <p><strong>${insight.message}</strong></p>
                    
                    <div class="stats-grid" style="margin: 1rem 0;">
                        <div class="stat-item">
                            <div class="stat-value">${streak}</div>
                            <div class="stat-label">Day Streak</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${trend}</div>
                            <div class="stat-label">Trend</div>
                        </div>
                    </div>
                    
                    <div class="insight-tips">
                        <p><strong>Personalized Recommendations:</strong></p>
                        <ul>
                            ${insight.tips
                              .map((tip) => `<li>${tip}</li>`)
                              .join("")}
                        </ul>
                        
                        <div style="margin-top: 1rem; padding: 1rem; background: rgba(116, 185, 255, 0.1); border-radius: 8px;">
                            <strong>🤖 AI Insight:</strong> ${
                              insight.aiRecommendation
                            }
                        </div>
                    </div>
                </div>
            `;

  showNotification(`Mood logged successfully! ${insight.message}`, "success");
}

function updateMoodStats() {
  const avgMood = calculateAverageMood();
  const streak = calculateMoodStreak();
  const totalEntries = applicationState.moodHistory.length;
  const trend = calculateMoodTrend();

  document.getElementById("avgMood").textContent = avgMood.toFixed(1);
  document.getElementById("moodStreak").textContent = streak;
  document.getElementById("totalEntries").textContent = totalEntries;
  document.getElementById("moodTrend").textContent = trend;
}

function calculateAverageMood() {
  if (applicationState.moodHistory.length === 0) return 0;

  const total = applicationState.moodHistory.reduce(
    (sum, entry) => sum + entry.score,
    0
  );
  return total / applicationState.moodHistory.length;
}

function calculateMoodStreak() {
  if (applicationState.moodHistory.length === 0) return 0;

  let streak = 1;
  const sortedHistory = [...applicationState.moodHistory].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  for (let i = 1; i < sortedHistory.length; i++) {
    if (sortedHistory[i].score >= 3) {
      // Good or better
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateMoodTrend() {
  if (applicationState.moodHistory.length < 3) return "--";

  const recent = applicationState.moodHistory.slice(-7); // Last 7 days
  const older = applicationState.moodHistory.slice(-14, -7); // Previous 7 days

  if (older.length === 0) return "--";

  const recentAvg =
    recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length;
  const olderAvg =
    older.reduce((sum, entry) => sum + entry.score, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 0.3) return "📈 Rising";
  if (diff < -0.3) return "📉 Declining";
  return "➡️ Stable";
}

function updateWellnessProgress() {
  const avgMood = calculateAverageMood();
  const progress = Math.min(100, (avgMood / 5) * 100);

  document.getElementById("wellnessProgress").style.width = progress + "%";
  document.getElementById("wellnessPercentage").textContent =
    Math.round(progress) + "%";
}

// Advanced Search and Filtering
function performGlobalSearch(event) {
  applicationState.searchQuery = event.target.value.toLowerCase();

  // Debounce search
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    // Re-display filtered content
    if (applicationState.quotesData.length > 0) {
      displayAdvancedQuote(getPersonalizedQuote());
    }
    if (applicationState.newsData.length > 0) {
      displayAdvancedNews(applicationState.newsData);
    }

    showNotification(
      `Searching for: "${applicationState.searchQuery}"`,
      "info"
    );
  }, 300);
}

function applySorting() {
  applicationState.sortBy = document.getElementById("sortBy").value;

  // Re-apply current displays with new sorting
  if (applicationState.quotesData.length > 0) {
    displayAdvancedQuote(getPersonalizedQuote());
  }
  if (applicationState.newsData.length > 0) {
    displayAdvancedNews(applicationState.newsData);
  }

  showNotification(`Sorted by: ${applicationState.sortBy}`, "info");
}

function filterQuotes(filter) {
  applicationState.currentFilters.quotes = filter;

  // Update filter buttons
  document
    .querySelectorAll(".card:first-of-type .filter-btn")
    .forEach((btn) => {
      btn.classList.remove("active");
    });
  event.target.classList.add("active");

  // Re-display with new filter
  if (applicationState.quotesData.length > 0) {
    displayAdvancedQuote(getPersonalizedQuote());
  }

  showNotification(`Quote filter: ${filter}`, "info");
}

function filterNews(category) {
  applicationState.currentFilters.news = category;

  // Update filter buttons
  event.target.parentElement.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Reload news with new category
  loadAdvancedNews();

  showNotification(`Loading news for: ${category}`, "info");
}

// Enhanced utility functions
function updateAPIStatus(statusId, status) {
  const statusDot = document.getElementById(statusId);
  if (statusDot) {
    statusDot.className = `status-dot ${status}`;
  }

  applicationState.apiStatus[statusId.replace("Status", "")] = status;
}

function updateAPISource(sourceId, source) {
  const sourceEl = document.getElementById(sourceId);
  if (sourceEl) {
    sourceEl.textContent = source;
  }
}

function formatAdvancedDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString();
}

function openAdvancedArticle(url, title) {
  if (url && url !== "#") {
    window.open(url, "_blank");
    logActivity(`Opened article: ${title}`);
  } else {
    showNotification(
      "This is demo content from external API fallback data.",
      "info"
    );
  }
}

function showNotification(message, type) {
  const notificationContainer = document.getElementById(
    "notificationContainer"
  );
  const notification = document.createElement("div");
  notification.className = `notification ${type}-message`;
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

function logActivity(activity) {
  console.log(
    `🧠 MindfulMe Advanced: ${activity} at ${new Date().toLocaleTimeString()}`
  );
}

function findLocalResources() {
  showNotification("Searching for local mental health resources...", "info");

  // Simulate local resource search
  setTimeout(() => {
    const crisisContainer = document.getElementById("crisisResources");
    crisisContainer.innerHTML += `
                    <div class="data-item" style="border-left-color: #fd79a8;">
                        <div class="data-title">🏥 Local Community Mental Health Center</div>
                        <div class="data-meta">
                            <span>📍 Search: "community mental health" + your city</span>
                            <span>🕒 Business Hours</span>
                        </div>
                        <div class="data-description">Find local community mental health services, therapy options, and support groups in your area.</div>
                        <div class="data-tags">
                            <div class="data-tag">Local Services</div>
                            <div class="data-tag">Therapy</div>
                        </div>
                    </div>
                    <div class="data-item" style="border-left-color: #6c5ce7;">
                        <div class="data-title">💻 BetterHelp Online Therapy</div>
                        <div class="data-meta">
                            <span>🌐 betterhelp.com</span>
                            <span>📱 App Available</span>
                        </div>
                        <div class="data-description">Professional online counseling and therapy sessions with licensed therapists.</div>
                        <div class="data-tags">
                            <div class="data-tag">Online Therapy</div>
                            <div class="data-tag">Licensed</div>
                        </div>
                    </div>
                `;

    showNotification("Local mental health resources added! 🏥", "success");
  }, 1500);
}

// Enhanced initialization with animation delays
setTimeout(() => {
  updateAPIStatus("quotesStatus", "loading");
  updateAPIStatus("weatherStatus", "loading");
  updateAPIStatus("newsStatus", "loading");
}, 500);

// Auto-refresh functionality
setInterval(() => {
  if (Math.random() < 0.05) {
    // 5% chance every 30 seconds
    const encouragements = [
      "Remember to take mindful breaths 🌬️",
      "You're doing amazing! Keep it up! 💙",
      "Take a moment to appreciate yourself 🧘‍♀️",
      "Your mental health journey matters ✨",
      "Stay present and kind to yourself 🌱",
    ];
    const randomMessage =
      encouragements[Math.floor(Math.random() * encouragements.length)];
    console.log(`💙 MindfulMe: ${randomMessage}`);
  }
}, 30000);

// Performance monitoring
window.addEventListener("load", () => {
  const loadTime = performance.now();
  console.log(`⚡ MindfulMe loaded in ${loadTime.toFixed(2)}ms`);
});
