/* eslint no-param-reassign: 0*/

import React from 'react';
import ReactD3 from 'react-d3-components';
import WordCloud from './WordCloud.jsx';
import { getTextStats,
         analyzeText,
         getAutomatedReadabilityIndex,
       } from '../../server/utils/customTextAnalytics';

export default function UserAnalytics(prop) {
  const textData = prop.data;
  // aggregate text
  const combinedTextInputs =
    textData.reduce((acc, curr) => {
      acc += `${curr} `;
      return acc;
    }, '');

  const overallAnalysis = analyzeText(combinedTextInputs);
  const overallTextStats = getTextStats(combinedTextInputs);
  const overallARI = getAutomatedReadabilityIndex(combinedTextInputs).score;

  // find top three most used words
  const topThreeArray = [];
  const topThree = overallAnalysis.topThree;
  for (const key in topThree) {
    if (topThree.hasOwnProperty(key)) {
      topThreeArray.push({ x: key, y: topThree[key] });
    }
  }

  // individual
  const individualTextAverages = [];
  textData.map((textInput) => {
    const stats = getTextStats(textInput);
    individualTextAverages.push({
      wordLength: stats.charactersPerWord,
      sentenceLength: stats.wordsPerSentence,
      ARI: getAutomatedReadabilityIndex(textInput).score,
    });
    return individualTextAverages;
  });

  // Pie Chart
  const PieChart = ReactD3.PieChart;
  const pieChartData = {
    label: 'topThreeAllTime',
    values: topThreeArray,
  };
  const sort = null;

  // Bar Chart
  const BarChart = ReactD3.BarChart;
  const barChartData = [{
    label: 'allTimeAverages',
    values: [
      { x: 'Word Length', y: overallTextStats.charactersPerWord },
      { x: 'Sentence Length', y: overallTextStats.wordsPerSentence },
      { x: 'ARI', y: overallARI },
    ],
  }];

  // Line Graphs
  const lineWordLength = [];
  const lineSentenceLength = [];
  const lineARI = [];
  for (let i = 0; i < individualTextAverages.length; i++) {
    lineWordLength.push({
      x: i, y: individualTextAverages[i].wordLength,
    });
    lineSentenceLength.push({
      x: i, y: individualTextAverages[i].sentenceLength,
    });
    lineARI.push({
      x: i, y: individualTextAverages[i].ARI,
    });
  }
  const LineChart = ReactD3.LineChart;
  const lineChartData = [
    {
      label: 'charactersPerWord',
      values: lineWordLength,
    },
    {
      label: 'wordsPerSentence',
      values: lineSentenceLength,
    },
    {
      label: 'ARI',
      values: lineARI,
    },
  ];

  return (
    <div id="userAnalytics">
      <h1 id="text-input-title">Your Personal Analytics</h1>
      <div id="piechart">
        <h2>All Time Most-Used Words</h2>
        <PieChart
          data={pieChartData}
          width={600}
          height={400}
          margin={ { top: 10, bottom: 10, left: 100, right: 100 } }
          sort={sort}
        />
      </div>
      <div id="barchart">
        <h2>All Time Averages</h2>
        <BarChart
          data={barChartData}
          width={500}
          height={500}
          margin={ { top: 10, bottom: 50, left: 50, right: 10 } }
        />
      </div>
      <div id="linechart">
        <h2>Stats Over Time</h2>
        <h3 id="charsPerWordStat">Characters Per Word</h3>
        <h3 id="wordsPerSentenceStat">Words Per Sentence</h3>
        <h3 id="ARIStat">Average Readability Index</h3>
        <LineChart
          data={lineChartData}
          width={500}
          height={500}
          margin={ { top: 10, bottom: 50, left: 50, right: 10 } }
        />
      </div>
      <WordCloud text={combinedTextInputs} />
    </div>
  );
}

UserAnalytics.propTypes = {
  textData: React.PropTypes.array,
  // speechData: React.PropTypes.array,
};
