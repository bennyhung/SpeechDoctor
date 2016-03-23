import $ from 'jquery';
import { wordsAPIKey } from '../../API_KEYS';
/**
 * Helper functions for custom text analytics
 */

// get each word's word count
function countEachWord(textInput) {
  // split up input string into arrays by spaces and newline chars
  const whiteSpaceChars = /\s/;
  const allWords = textInput.split(whiteSpaceChars);
  const wordCountObject = {};

  allWords.forEach((currentWord) => {
    // get rid of punctuation and make word lowercase
    const editedWord = currentWord.replace(/\W/g, '').toLowerCase();
    // account for empty strings (aka trailed whitespace)
    if (editedWord.length) {
      if (!wordCountObject[editedWord]) {
        wordCountObject[editedWord] = 1;
      } else {
        wordCountObject[editedWord] += 1;
      }
    }
  });

  return wordCountObject;
}

// find the top three most-used words, excluding 'the', 'a', 'an', and 'and'
function topThreeWords(wordCountObject) {
  const wordsToIgnore = /the\b|a\b|an\b|and\b|is\b/;

  // avoid modifying original wordCountObject
  const copiedObj = JSON.parse(JSON.stringify(wordCountObject));
  const mostCommonWords = {};

  const wordKeys = Object.keys(copiedObj);
  let i = 0;

  wordKeys.forEach((word) => {
    if (word.match(wordsToIgnore)) {
      delete copiedObj[word];
    }
  });

  function findCurrentMostFrequent(wordObj) {
    let largest = 0;
    let mostUsed = '';
    const currentKeys = Object.keys(wordObj);
    currentKeys.forEach((key) => {
      if (wordObj[key] > largest) {
        largest = wordObj[key];
        mostUsed = key;
      }
    });
    mostCommonWords[mostUsed] = largest;
    delete copiedObj[mostUsed];
  }

  while (i < 3) {
    if (Object.keys(copiedObj).length) {
      findCurrentMostFrequent(copiedObj);
    }
    i++;
  }

  return mostCommonWords;
}

// checks to see if any 'avoid' words (words the user wants to avoid) were used
function checkWordsToAvoid(wordsToAvoidArr, allWordsUsedObj) {
  const wordsUsed = {};
  wordsToAvoidArr.forEach((word) => {
    if (allWordsUsedObj[word]) {
      wordsUsed[word] = allWordsUsedObj[word];
    }
  });

  if (Object.keys(wordsUsed).length) {
    return wordsUsed;
  }

  return 'Congrats! You didn\'t use any of the words you were avoiding!';
}


// make call to Words API
export function getDefs(word, callback) {
  const wordsAPI = `https://wordsapiv1.p.mashape.com/words/${word}`;
  const response = {};
  // get definitions and part of speech
  $.ajax({
    url: wordsAPI,
    type: 'GET',
    async: true,
    success: (data) => {
      response.pos = data.results[0].partOfSpeech;
      response.def = data.results[0].definition;
      callback(null, response);
    },
    error: (err) => {
      callback(err, null);
      throw new Error('There was an error making the GET request to the words API!', err);
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader('X-Mashape-Key', wordsAPIKey);
      xhr.setRequestHeader('Accept', 'application/json');
    },
  });
}

export function getSyns(word, callback) {
  const datamuseAPI = `https://api.datamuse.com/words?max=5&rel_syn=${word}`;
  const response = {};
  // get synonyms
  $.ajax({
    type: 'GET',
    url: datamuseAPI,
    async: true,
    dataType: 'JSON',
    success: (data) => {
      response.syns = data;
      callback(null, response);
    },
    error: (err) => {
      callback(err, null);
      throw new Error('Error - ', err);
    },
  });
}

// call helper functions to get analytics
export function analyzeText(userTextInput, wordsToAvoid) {
  const analytics = {};

  // word totals
  const totalOfEachWord = countEachWord(userTextInput);
  analytics.allTotals = totalOfEachWord;

  // words to avoid
  if (wordsToAvoid) {
    analytics.wordsNotAvoided = checkWordsToAvoid(wordsToAvoid, totalOfEachWord);
  } else {
    analytics.wordsNotAvoided = 'No words to avoid';
  }

  // top used words
  const threeMostUsed = topThreeWords(totalOfEachWord);
  analytics.topThree = threeMostUsed;

  return analytics;
}

export function countChars(textInput) {
  const charCounts = {};

  charCounts.withSpace = textInput.length;
  charCounts.noSpace = textInput.match(/\S+/g).length;
  charCounts.letters = textInput.match(/[A-Z]/gi).length;

  return charCounts;
}

export function sentenceCount(textInput) {
  const sentences = {};

  sentences.count = textInput.match(/\w[.?!](\s|$)/g).length;

  return sentences;
}

export function wordCount(textInput) {
  const words = {};

  words.count = textInput.match(/\S+/g).length;

  return words;
}
