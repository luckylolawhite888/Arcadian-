#!/usr/bin/env python3
"""
Guess the Location Game
Uses web search to find interesting location images for guessing game.
"""

import random
import json
from datetime import datetime

class GuessLocationGame:
    def __init__(self):
        self.locations = self.load_locations()
        self.current_game = None
        self.score = 0
        self.rounds_played = 0
        
    def load_locations(self):
        """Pre-defined interesting locations for the game"""
        return [
            {
                "name": "Santorini, Greece",
                "hint": "White buildings, blue domes, Mediterranean island",
                "difficulty": "Easy",
                "continent": "Europe",
                "image_search": "Santorini Greece white buildings blue domes"
            },
            {
                "name": "Times Square, New York",
                "hint": "Bright lights, Broadway, giant billboards",
                "difficulty": "Easy", 
                "continent": "North America",
                "image_search": "Times Square New York night lights"
            },
            {
                "name": "Machu Picchu, Peru",
                "hint": "Ancient Incan ruins, mountain peaks, South America",
                "difficulty": "Medium",
                "continent": "South America",
                "image_search": "Machu Picchu Peru ruins mountains"
            },
            {
                "name": "Tokyo Shibuya Crossing",
                "hint": "World's busiest pedestrian crossing, neon lights, Japan",
                "difficulty": "Medium",
                "continent": "Asia",
                "image_search": "Shibuya Crossing Tokyo pedestrian scramble"
            },
            {
                "name": "Sydney Opera House",
                "hint": "White sails, harbor, iconic Australian landmark",
                "difficulty": "Easy",
                "continent": "Australia",
                "image_search": "Sydney Opera House Australia harbor"
            },
            {
                "name": "Eiffel Tower, Paris",
                "hint": "Iron lattice, romantic city, French landmark",
                "difficulty": "Easy",
                "continent": "Europe",
                "image_search": "Eiffel Tower Paris France"
            },
            {
                "name": "Pyramids of Giza",
                "hint": "Ancient wonders, desert, camels, Egypt",
                "difficulty": "Easy",
                "continent": "Africa",
                "image_search": "Pyramids of Giza Egypt desert"
            },
            {
                "name": "Venice Canals",
                "hint": "Water city, gondolas, bridges, Italy",
                "difficulty": "Medium",
                "continent": "Europe",
                "image_search": "Venice Italy canals gondolas"
            },
            {
                "name": "Grand Canyon",
                "hint": "Massive canyon, red rocks, Arizona, USA",
                "difficulty": "Medium",
                "continent": "North America",
                "image_search": "Grand Canyon Arizona USA"
            },
            {
                "name": "Great Wall of China",
                "hint": "Long wall, mountains, ancient fortification",
                "difficulty": "Easy",
                "continent": "Asia",
                "image_search": "Great Wall of China mountains"
            }
        ]
    
    def start_new_game(self, rounds=5):
        """Start a new game with random locations"""
        self.current_game = {
            "start_time": datetime.now().isoformat(),
            "rounds": rounds,
            "current_round": 0,
            "locations": random.sample(self.locations, rounds),
            "answers": [],
            "score": 0
        }
        return self.current_game
    
    def get_current_round(self):
        """Get current round location"""
        if not self.current_game:
            return None
        
        game = self.current_game
        if game["current_round"] >= game["rounds"]:
            return None
        
        return game["locations"][game["current_round"]]
    
    def submit_answer(self, answer):
        """Submit answer for current round"""
        if not self.current_game:
            return {"error": "No active game"}
        
        game = self.current_game
        current_location = self.get_current_round()
        
        if not current_location:
            return {"error": "Game completed"}
        
        # Calculate points (simplified - would use distance in real game)
        is_correct = answer.lower() == current_location["name"].lower()
        points = 10 if is_correct else 0
        
        # Record answer
        game["answers"].append({
            "location": current_location["name"],
            "user_answer": answer,
            "correct": is_correct,
            "points": points,
            "hint": current_location["hint"]
        })
        
        game["score"] += points
        game["current_round"] += 1
        
        return {
            "correct": is_correct,
            "correct_answer": current_location["name"],
            "points": points,
            "total_score": game["score"],
            "round": game["current_round"],
            "total_rounds": game["rounds"],
            "hint": current_location["hint"]
        }
    
    def get_game_results(self):
        """Get final game results"""
        if not self.current_game:
            return {"error": "No active game"}
        
        game = self.current_game
        return {
            "total_score": game["score"],
            "max_score": game["rounds"] * 10,
            "correct_answers": sum(1 for a in game["answers"] if a["correct"]),
            "total_rounds": game["rounds"],
            "answers": game["answers"],
            "start_time": game["start_time"],
            "end_time": datetime.now().isoformat()
        }
    
    def get_multiple_choice(self, location):
        """Generate multiple choice options for a location"""
        correct = location["name"]
        
        # Get other locations (exclude correct one)
        other_locations = [loc for loc in self.locations if loc["name"] != correct]
        
        # Try to get locations from same continent first
        same_continent = [loc for loc in other_locations 
                         if loc["continent"] == location["continent"]]
        
        # If not enough from same continent, use any locations
        if len(same_continent) >= 3:
            wrong_answers = random.sample(same_continent, 3)
        else:
            # Use same continent ones plus random others
            wrong_answers = same_continent
            remaining = 3 - len(same_continent)
            other_options = [loc for loc in other_locations if loc not in same_continent]
            if other_options:
                wrong_answers.extend(random.sample(other_options, min(remaining, len(other_options))))
        
        # Combine and shuffle
        options = [correct] + [loc["name"] for loc in wrong_answers]
        random.shuffle(options)
        
        return options
    
    def get_location_image_search(self, location):
        """Get search query for location image"""
        return location["image_search"]


def main():
    """Test the game"""
    game = GuessLocationGame()
    game.start_new_game(rounds=3)
    
    print("🎮 Guess the Location Game")
    print("=" * 30)
    
    while True:
        current = game.get_current_round()
        if not current:
            break
        
        print(f"\nRound {game.current_game['current_round'] + 1}")
        print(f"Hint: {current['hint']}")
        print(f"Difficulty: {current['difficulty']}")
        
        options = game.get_multiple_choice(current)
        print("\nOptions:")
        for i, opt in enumerate(options, 1):
            print(f"{i}. {opt}")
        
        # Simulate answer
        answer = current["name"]  # Simulate correct answer
        result = game.submit_answer(answer)
        print(f"\nResult: {'✅ Correct' if result['correct'] else '❌ Wrong'}")
        print(f"Points: {result['points']}")
        print(f"Total Score: {result['total_score']}")
    
    results = game.get_game_results()
    print("\n" + "=" * 30)
    print("🏆 GAME COMPLETE!")
    print(f"Final Score: {results['total_score']}/{results['max_score']}")
    print(f"Correct: {results['correct_answers']}/{results['total_rounds']}")


if __name__ == "__main__":
    main()