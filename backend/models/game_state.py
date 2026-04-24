from constants.word_list import WORDS
from constants.morse_dict import MORSE_DICT
import time
import random

class GameState:
    def __init__(self):
        self.max_level = 4
        self.level_time_limits = {
            1: 120,  # level 1
            2: 90,   # level 2 (1.5 min)
            3: 90,   # level 3 (1.5 min)
            4: 90,   # level 4 (extreme, 1.5 min for now)
        }

        # game progress
        self.target_word = ""
        self._last_word = None
        self.target_word_index = 0
        self.target_letter = ""
        self.current_sequence = ""

        self.score = 0
        self.level = 1
        self.start_time = None
        self.time_limit = 120 # seconds
        self.is_active = False
        self.end_reason = None


    
    # functions
    def _start_level(self, level: int):
        self.level = level
        self.time_limit = self.level_time_limits.get(level, 90)
        self.start_time = time.time()
        self.current_sequence = ""
        self.pick_new_word()

    def start_game(self):
        self.score = 0
        self.is_active = True
        self.end_reason = None
        self._start_level(1)
        

    def pick_new_word(self):
        level_words = WORDS.get(self.level, WORDS[3])
        if len(level_words) > 1:
            picked = random.choice(level_words)
            while picked == self._last_word:
                picked = random.choice(level_words)
            self.target_word = picked
        else:
            self.target_word = random.choice(level_words)

        self._last_word = self.target_word
        self.target_word_index = 0
        self.target_letter = self.target_word[self.target_word_index]

    def get_time_left(self):
        # guard against calling this before the game starts
        if self.start_time is None:
            return 0

        elapsed_time = time.time() - self.start_time
        remaining_time = max(0, int(self.time_limit - elapsed_time))

        if remaining_time == 0 and self.is_active:
            self.end_game(reason="TIME_UP")

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
                if self.level >= self.max_level:
                    self.end_game(reason="FINISHED_ALL_LEVELS")
                    return

                self._start_level(self.level + 1)
                
        
        elif not expected_morse.startswith(self.current_sequence):
           
            self.score = max(0, self.score - 1)


    def add_signal(self, signal):
        expected_morse = MORSE_DICT.get(self.target_letter, "")
        
        # 1.  If the previous sequence was wrong, clear it BEFORE adding the new blink
        if len(self.current_sequence) > 0 and not expected_morse.startswith(self.current_sequence):
            self.current_sequence = ""

        # 2. Add the new signal
        if signal == "DOT":
            self.current_sequence += "."
        if signal == "DASH":
            self.current_sequence += "-"

        self.check_match()

    
    def end_game(self, reason: str | None = None):
        self.is_active = False
        self.end_reason = reason


    def get_state_dict(self):
        # return the state ofthe game
        return {
            "isActive": self.is_active,
            "score": self.score,
            "level": self.level,
            "maxLevel": self.max_level,
            "timeLeft": self.get_time_left(),
            "targetWord": self.target_word,
            "targetWordIndex": self.target_word_index,
            "targetLetter": self.target_letter,
            "currentSequence": self.current_sequence,
            "endReason": self.end_reason,
        }
    

game_state = GameState()
