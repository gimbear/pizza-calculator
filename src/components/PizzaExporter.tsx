// ExportToMarkdown.tsx
import React, { useState } from 'react';
import { markdownTable } from 'markdown-table';

// Define the type for an ingredient
interface Ingredient {
  name: string;
  percentage: string;
  weight: number;
}

interface PizzaExporterProps {
  activeTab: 'weight' | 'doughBalls';
  flourWeight: string;
  numberOfBalls: string;
  weightPerBall: string;
  ingredients: Ingredient[];
  totalWeight: number;
}

function PizzaExporter(props: PizzaExporterProps) {
  const {
    activeTab,
    flourWeight,
    numberOfBalls,
    weightPerBall,
    ingredients,
    totalWeight,
  } = props;

  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  // Function to generate Markdown content
  const generateMarkdown = () => {
    let markdown = `# Pizza Dough Recipe\n\n`;

    if (activeTab === 'doughBalls') {
      markdown += `- **Number of Balls**: ${numberOfBalls}\n`;
      markdown += `- **Weight per Ball**: ${weightPerBall}g\n\n`;
    } else {
      markdown += `- **Flour Weight**: ${parseFloat(flourWeight).toFixed(2)}g\n\n`;
    }

    markdown += `## Ingredients\n\n`;

    // Build the table data
    const tableData = [
      ['Ingredient', "Baker's Percentage (%)", 'Weight (g)'],
      // The markdownTable function handles the header separator automatically
      ['Flour', '100', parseFloat(flourWeight).toFixed(2)],
    ];

    ingredients.forEach((ingredient) => {
      const isPreFerment = ingredient.name.toLowerCase() === 'pre-ferment';
      const ingredientName = isPreFerment ? `*${ingredient.name}*` : ingredient.name;
      tableData.push([
        ingredientName,
        ingredient.percentage,
        ingredient.weight.toFixed(2),
      ]);
    });

    // Total weight row
    tableData.push(['**Total**', '', `**${totalWeight.toFixed(2)}**`]);

    // Generate the markdown table using 'markdown-table'
    const table = markdownTable(tableData, { align: ['l', 'c', 'r'] });

    markdown += `${table}\n`;

    setMarkdownContent(markdown);
    setShowMarkdown(true);
  };

  // Function to copy markdown to clipboard
  const copyMarkdownToClipboard = () => {
    navigator.clipboard.writeText(markdownContent);
    alert('Markdown copied to clipboard!');
  };

  return (
    <div className="mt-6 text-center">
      <button
        onClick={generateMarkdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Export to Markdown
      </button>

      {/* Display the markdown content if showMarkdown is true */}
      {showMarkdown && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Markdown Output</h2>
          <textarea
            className="w-full h-64 p-2 border border-gray-300 rounded-md"
            value={markdownContent}
            readOnly
          ></textarea>
          <div className="mt-2 flex justify-between">
            <button
              onClick={copyMarkdownToClipboard}
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => setShowMarkdown(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PizzaExporter;