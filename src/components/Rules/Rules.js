import React from 'react';
import './Rules.css';

const Rules = () => {
  
  return (
    <div className="instructions">
      <h3>🤓 How to play! 📓</h3>
      <p>First, you need to pick a letter! One person should start saying the alphabet really quickly and someone else stops them by saying "Basta"!</p>
      <p>Now someone should enter the selected letter in the top left of the screen</p>
      <p>Now that you have a letter, everyone should think of a word for each category in the table that starts with that letter</p>
      <p>Once you finish writing your words, say "Basta" and click the "Basta" button</p>
      <p>When the first person says "Basta" that means everyone else has to stop where they are</p>
      <p>Everyone can compare the words they have for each category and calculate their score</p>
      <p>If you have a word that no one else, you get 10 points</p>
      <p>If you have a word that someone else also has, you get 5 points</p>
      <p>If you didn't fill out a word, or chose a word that starts with the wrong letter, you get 0 points</p>
      <p>Tally your scores in the scoreboard, and play another round!</p>
    </div>
  )
};

export default Rules;