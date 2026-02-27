from constants.word_list import WORDS
from constants.morse_dict import MORSE_DICT
import time
import random

class GameState:
    def __init__(self):

        # game progress
        self.target_word = ""
        self.target_word_index = 0
        self.target_letter = ""
        self.current_sequence = ""

        self.score = 0
        self.level = 1
        self.start_time = None
        self.time_limit = 120 # seconds
        self.is_active = False


    
    # functions

    def start_game(self):
        self.score = 0
        self.level = 1
        self.start_game = time.time()
        self.is_active = True
        self.current_sequence = ""
        self.pick_new_word()
        

    def pick_new_word(self):
        level_words = WORDS.get(self.level, WORDS[3])
        self.target_word = random.choice(level_words)
        self.target_word_index = 0
        self.target_letter = self.target_word[self.target_word_index]

    def get_time_left(self):
        elapsed_time = time.time() - self.start_time
        remaining_time = max(0, elapsed_time - self.time_limit)

        if remaining_time == 0 and self.is_active:
            self.end_game()

        return remaining_time

        
    def check_match(self):
        """I thought of having a scoring ssytem
        letter-correct guess: +2 points
        letter-wrong guess: -1 points
        whole word correct guess = +10 points
        
        """
        expected_morse = MORSE_DICT.get(self.target_letter, "")
        
        
        if self.current_sequence == expected_morse:
            # if they get correct match
            self.current_sequence = ""
            self.target_word_index += 1
            self.score += 2
            
            # check if target word is finished
            if self.target_word_index < len(self.target_word):
                
                self.target_letter = self.target_word[self.target_word_index]
            
            else:
                # word completed
                self.score += 10
                self.level += 1  
                self._pick_new_word()
                
        
        elif not expected_morse.startswith(self.current_sequence):
            self.current_sequence = ""
            self.score = max(0, self.score - 1)


    def add_signal(self, signal):
        if signal == "DOT":
            self.current_sequence += "."
        if signal == "DASH":
            self.current_sequence += "-"

        self.check_match()

    
    def end_game(self):
        self.is_active = False
        

    def get_state_dict(self):
        # return the state ofthe game
        return {
            "isActive": self.is_active,
            "score": self.score,
            "level": self.level,
            "timeLeft": self.get_time_left(),
            "targetWord": self.target_word,
            "targetLetter": self.target_letter,
            "currentSequence": self.current_sequence
        }