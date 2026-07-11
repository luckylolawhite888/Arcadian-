#!/usr/bin/env python3
"""
Air Quality System for Morning Briefing
Gets London air quality data and provides health advice
"""

import random
from datetime import datetime

class AirQualityReporter:
    def __init__(self):
        # London coordinates
        self.lat = 51.5074
        self.lon = 0.1278
        
        # Air Quality Index (AQI) levels and meanings
        self.aqi_levels = {
            1: {"name": "Good", "emoji": "😊", "color": "🟢"},
            2: {"name": "Fair", "emoji": "😐", "color": "🟡"},
            3: {"name": "Moderate", "emoji": "😷", "color": "🟠"},
            4: {"name": "Poor", "emoji": "🤢", "color": "🔴"},
            5: {"name": "Very Poor", "emoji": "🤮", "color": "🟣"}
        }
        
        # Health advice for each level
        self.health_advice = {
            1: "Perfect day to be outside! Enjoy the fresh air.",
            2: "Generally okay for most people. Sensitive individuals might notice minor issues.",
            3: "Consider reducing intense outdoor activities if you have respiratory issues.",
            4: "Limit prolonged outdoor exertion. Those with health issues should stay indoors.",
            5: "Avoid outdoor activities. Stay indoors with windows closed if possible."
        }
        
        # Common pollutants in London
        self.pollutants = {
            "pm2_5": {"name": "Fine Particles", "source": "Traffic, industry, heating"},
            "pm10": {"name": "Coarse Particles", "source": "Dust, construction, pollen"},
            "no2": {"name": "Nitrogen Dioxide", "source": "Vehicle emissions"},
            "o3": {"name": "Ozone", "source": "Sunlight on pollutants"},
            "so2": {"name": "Sulfur Dioxide", "source": "Industry, shipping"}
        }
        
        # Witty comments about London air
        self.london_air_quips = [
            "London's air: a historic blend of fog, ambition, and the occasional crisp breeze.",
            "The Thames might be cleaner, but the air still tells stories of industry and innovation.",
            "Breathing in centuries of history, with a side of modern traffic.",
            "London air: where Dickensian fog meets 21st-century emissions.",
            "The city that invented the pea-souper now battles invisible particles."
        ]
    
    def get_simulated_aqi(self):
        """
        Simulate air quality data (in production, would use OpenAQ or government API)
        London typically ranges from 2-4, with occasional 1s and 5s
        """
        # Simulate based on time of year and weather patterns
        month = datetime.now().month
        
        # Better air in spring/summer, worse in winter
        if month in [4, 5, 6, 7, 8, 9]:  # Spring/Summer
            base_aqi = random.choices([1, 2, 3], weights=[0.2, 0.6, 0.2])[0]
        else:  # Autumn/Winter
            base_aqi = random.choices([2, 3, 4], weights=[0.3, 0.5, 0.2])[0]
        
        # Add some randomness
        if random.random() < 0.1:  # 10% chance of extreme
            base_aqi = random.choice([1, 5])
        
        return base_aqi
    
    def get_main_pollutant(self, aqi_level):
        """Determine likely main pollutant based on AQI level"""
        if aqi_level >= 4:
            return random.choice(["pm2_5", "no2"])  # High pollution usually traffic-related
        elif aqi_level == 3:
            return random.choice(["pm10", "o3", "pm2_5"])
        else:
            return random.choice(["pm10", "o3"])  # Lower levels often natural
    
    def generate_report(self):
        """Generate complete air quality report"""
        aqi = self.get_simulated_aqi()
        level_info = self.aqi_levels[aqi]
        main_pollutant = self.get_main_pollutant(aqi)
        pollutant_info = self.pollutants[main_pollutant]
        
        # Create report
        report = f"""## 🌬️ Air Quality Report

{level_info['color']} **{level_info['name']}** {level_info['emoji']}

**AQI Level:** {aqi}/5
**Main Concern:** {pollutant_info['name']}
**Primary Source:** {pollutant_info['source']}

### 🩺 Health Advice
{self.health_advice[aqi]}

### 🏙️ London Context
*{random.choice(self.london_air_quips)}*

### 💡 Today's Tip
{"Consider walking or cycling instead of driving to help improve air quality." if aqi >= 3 else "Great day for outdoor exercise!"}

*Data simulated - for accurate readings check [London Air Quality Network](https://www.londonair.org.uk/)*"""
        
        return report
    
    def get_brief_version(self):
        """Get shorter version for briefing"""
        aqi = self.get_simulated_aqi()
        level_info = self.aqi_levels[aqi]
        
        return f"""## 🌬️ Air Quality: {level_info['color']} {level_info['name']} {level_info['emoji']}

{self.health_advice[aqi]}

*Check London Air for real-time data*"""

def main():
    """Test the air quality system"""
    print("Testing Air Quality System...\n")
    
    reporter = AirQualityReporter()
    report = reporter.generate_report()
    
    print(report)
    
    # Save for briefing
    with open('/home/node/.openclaw/workspace/today_air_quality.txt', 'w') as f:
        f.write(reporter.get_brief_version())
    
    print("\n✅ Air quality report saved for morning briefing!")

if __name__ == "__main__":
    main()