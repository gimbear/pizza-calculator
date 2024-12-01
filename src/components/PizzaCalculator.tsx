import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PizzaExporter from '@/components/PizzaExporter';

// Define the type for an ingredient
interface Ingredient {
  name: string;
  percentage: string; // Baker's percentage as a string
  weight: number; // Calculated weight in grams
}

const PizzaCalculator = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'weight' | 'doughBalls'>('weight');
  const [flourWeight, setFlourWeight] = useState<string>('1000'); // Flour weight as a string
  const [numberOfBalls, setNumberOfBalls] = useState<string>('4');
  const [weightPerBall, setWeightPerBall] = useState<string>('250'); // Weight per ball in grams
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: 'Water', percentage: '66', weight: 660 },
    { name: 'Salt', percentage: '2', weight: 20 },
    { name: 'Malt', percentage: '1', weight: 10 },
    { name: 'Olive oil', percentage: '2', weight: 20 },
    { name: 'Pre-ferment', percentage: '20', weight: 200 },
  ]);

  // Read query parameters on mount
  useEffect(() => {
    if (!router.isReady) return;

    const query = router.query;

    // Parse activeTab from query
    if (query.activeTab) {
      const tab = query.activeTab as string;
      if (tab === 'weight' || tab === 'doughBalls') {
        setActiveTab(tab);
      }
    }

    // Parse flourWeight from query
    if (query.flourWeight) {
      const fwStr = query.flourWeight as string;
      setFlourWeight(fwStr);
    }

    // Parse numberOfBalls and weightPerBall from query
    if (query.numberOfBalls) {
      setNumberOfBalls(query.numberOfBalls as string);
    }
    if (query.weightPerBall) {
      setWeightPerBall(query.weightPerBall as string);
    }

    // Parse ingredients from query
    if (query.names && query.percentages) {
      const names = (query.names as string).split(',');
      const percentages = (query.percentages as string).split(',');

      // Exclude 'Flour' from ingredients
      const filteredNames: string[] = [];
      const filteredPercentages: string[] = [];

      names.forEach((name, index) => {
        if (name.toLowerCase() !== 'flour') {
          filteredNames.push(name);
          filteredPercentages.push(percentages[index]);
        }
      });

      if (filteredNames.length === filteredPercentages.length) {
        const newIngredients: Ingredient[] = filteredNames.map((name, i) => {
          const percentageStr = filteredPercentages[i];
          const parsedPercentage = parseFloat(percentageStr);
          const percentage = isNaN(parsedPercentage) ? '0' : percentageStr;
          return { name, percentage, weight: 0 }; // Weight will be calculated later
        });
        setIngredients(newIngredients);
      }
    }
  }, [router.isReady]);

  // Function to update query parameters
  const updateQueryParams = (
    flourWeight: string,
    ingredients: Ingredient[],
    activeTab: 'weight' | 'doughBalls',
    numberOfBalls: string,
    weightPerBall: string
  ) => {
    const names = ingredients.map((ingredient) => ingredient.name).join(',');
    const percentages = ingredients
      .map((ingredient) => ingredient.percentage)
      .join(',');

    const query: any = {
      activeTab,
      names,
      percentages,
    };

    if (activeTab === 'weight') {
      query.flourWeight = flourWeight;
    } else if (activeTab === 'doughBalls') {
      query.numberOfBalls = numberOfBalls;
      query.weightPerBall = weightPerBall;
    }

    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  // Handle tab change
  const handleTabChange = (tab: 'weight' | 'doughBalls') => {
    setActiveTab(tab);
    updateQueryParams(flourWeight, ingredients, tab, numberOfBalls, weightPerBall);
  };

  // Handle percentage change for an ingredient
  const handlePercentageChange = (
    index: number,
    newPercentage: string
  ): void => {
    const updatedIngredients = ingredients.map((ingredient, i) => {
      if (i === index) {
        return { ...ingredient, percentage: newPercentage };
      }
      return ingredient;
    });
    setIngredients(updatedIngredients);
  };

  // Handle percentage input blur event
  const handlePercentageBlur = (index: number): void => {
    let flourWeightNum = parseFloat(flourWeight) || 0;
  
    // If in 'doughBalls' mode, calculate flour weight dynamically
    if (activeTab === 'doughBalls') {
      flourWeightNum = calculateFlourWeight();
      setFlourWeight(flourWeightNum.toString());
    }
  
    const updatedIngredients = ingredients.map((ingredient, i) => {
      if (i === index) {
        const percentageStr = ingredient.percentage.trim();
        const parsedPercentage = parseFloat(percentageStr) || 0;
        const weight = (parsedPercentage / 100) * flourWeightNum;
  
        return {
          ...ingredient,
          percentage: parsedPercentage.toFixed(2), // Ensure valid number as a string
          weight: parseFloat(weight.toFixed(2)), // Limit weight to 2 decimal places
        };
      }
      return ingredient;
    });
  
    setIngredients(updatedIngredients);
  
    // Update query params to reflect the change
    updateQueryParams(flourWeight, updatedIngredients, activeTab, numberOfBalls, weightPerBall);
  };

  // Handle percentage input key down event
  const handlePercentageKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handlePercentageBlur(index);
      (event.currentTarget as HTMLInputElement).blur(); // Remove focus from the input
    }
  };

  // Handle flour weight change
  const handleFlourWeightChange = (newFlourWeight: string): void => {
    setFlourWeight(newFlourWeight);
  };

  // Handle flour weight blur
  const handleFlourWeightBlur = (): void => {
    let fw = flourWeight.trim();
    if (fw === '') fw = '0'; // Prevent empty input
    const flourWeightNum = parseFloat(fw) || 0;
  
    const updatedIngredients = ingredients.map((ingredient) => {
      const parsedPercentage = parseFloat(ingredient.percentage) || 0;
      const weight = (parsedPercentage / 100) * flourWeightNum;
  
      return {
        ...ingredient,
        weight: parseFloat(weight.toFixed(2)), // Ensure weight is rounded
      };
    });
  
    setFlourWeight(fw);
    setIngredients(updatedIngredients);
  
    // Update query params
    updateQueryParams(fw, updatedIngredients, activeTab, numberOfBalls, weightPerBall);
  };

  // Handle flour weight key down
  const handleFlourWeightKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleFlourWeightBlur();
      (event.currentTarget as HTMLInputElement).blur(); // Remove focus from the input
    }
  };

  // Handle number of balls change
  const handleNumberOfBallsChange = (value: string) => {
    setNumberOfBalls(value);
  };

  // Handle weight per ball change
  const handleWeightPerBallChange = (value: string) => {
    setWeightPerBall(value);
  };

  // Handle dough balls input blur
  const handleDoughBallsBlur = (): void => {
    const flourWeightNum = calculateFlourWeight();
  
    const updatedIngredients = ingredients.map((ingredient) => {
      const parsedPercentage = parseFloat(ingredient.percentage) || 0;
      const weight = (parsedPercentage / 100) * flourWeightNum;
  
      return {
        ...ingredient,
        weight: parseFloat(weight.toFixed(2)), // Ensure weight is valid
      };
    });
  
    setFlourWeight(flourWeightNum.toString());
    setIngredients(updatedIngredients);
  
    // Update query params
    updateQueryParams(
      flourWeightNum.toString(),
      updatedIngredients,
      activeTab,
      numberOfBalls,
      weightPerBall
    );
  };

  // Calculate flour weight based on dough balls inputs
  const calculateFlourWeight = (): number => {
    const numBalls = parseFloat(numberOfBalls) || 0;
    const weightBall = parseFloat(weightPerBall) || 0;
    const totalDoughWeight = numBalls * weightBall;
  
    if (totalDoughWeight === 0) return 0;
  
    // Sum of ingredient percentages (excluding flour)
    const sumPercentages = ingredients.reduce((sum, ingredient) => {
      const percentage = parseFloat(ingredient.percentage) || 0;
      return sum + percentage / 100;
    }, 0);
  
    // Avoid division by zero
    if (1 + sumPercentages === 0) return 0;
  
    return totalDoughWeight / (1 + sumPercentages);
  }, [numberOfBalls, weightPerBall, ingredients]);

  // Calculate total weight
  const totalWeight = ingredients.reduce(
    (sum, ingredient) => sum + ingredient.weight,
    parseFloat(flourWeight) || 0
  );

  // Update flour weight and ingredient weights when in dough balls mode
  useEffect(() => {
    if (activeTab === 'doughBalls') {
      const flourWeightNum = calculateFlourWeight();
      setFlourWeight(flourWeightNum.toString());

      // Recalculate ingredient weights
      const updatedIngredients = ingredients.map((ingredient) => {
        const parsedPercentage = parseFloat(ingredient.percentage) || 0;
        const weight = (parsedPercentage / 100) * flourWeightNum;
        return { ...ingredient, weight };
      });
      setIngredients(updatedIngredients);
    }
    // We include ingredients in dependency array to trigger recalculations when percentages change
  }, [
    activeTab,
    numberOfBalls,
    weightPerBall,
    ingredients.map((i) => i.percentage).join(','),
  ]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Pizza Calculator</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 border ${
            activeTab === 'weight' ? 'bg-gray-200' : 'bg-white'
          }`}
          onClick={() => handleTabChange('weight')}
        >
          Weight
        </button>
        <button
          className={`px-4 py-2 border ${
            activeTab === 'doughBalls' ? 'bg-gray-200' : 'bg-white'
          }`}
          onClick={() => handleTabChange('doughBalls')}
        >
          Dough Balls
        </button>
      </div>

      {activeTab === 'weight' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flour Weight (g)
          </label>
          <input
            type="number"
            value={flourWeight}
            onChange={(e) => handleFlourWeightChange(e.target.value)}
            onBlur={handleFlourWeightBlur}
            onKeyDown={handleFlourWeightKeyDown}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      )}

      {activeTab === 'doughBalls' && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Balls
            </label>
            <input
              type="number"
              value={numberOfBalls}
              onChange={(e) => handleNumberOfBallsChange(e.target.value)}
              onBlur={handleDoughBallsBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDoughBallsBlur();
                  e.currentTarget.blur();
                }
              }}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight per Ball (g)
            </label>
            <input
              type="number"
              value={weightPerBall}
              onChange={(e) => handleWeightPerBallChange(e.target.value)}
              onBlur={handleDoughBallsBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDoughBallsBlur();
                  e.currentTarget.blur();
                }
              }}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2 text-left">Ingredient</th>
            <th className="border border-gray-300 p-2 text-left">
              Baker's Percentage (%)
            </th>
            <th className="border border-gray-300 p-2 text-left">Weight (g)</th>
          </tr>
        </thead>
        <tbody>
          {/* Flour row (static and fixed at 100%) */}
          <tr className="hover:bg-gray-50">
            <td className="border border-gray-300 p-2">Flour</td>
            <td className="border border-gray-300 p-2">100</td>
            <td className="border border-gray-300 p-2">
              {parseFloat(flourWeight).toFixed(2)}
            </td>
          </tr>
          {/* Other ingredients */}
          {ingredients.map((ingredient, index) => {
            const isPreFerment = ingredient.name.toLowerCase() === 'pre-ferment';
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">
                  {isPreFerment ? <em>{ingredient.name}</em> : ingredient.name}
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    value={ingredient.percentage}
                    onChange={(e) =>
                      handlePercentageChange(index, e.target.value)
                    }
                    onBlur={() => handlePercentageBlur(index)}
                    onKeyDown={(e) => handlePercentageKeyDown(index, e)}
                    className="w-full border border-gray-300 rounded-md p-1"
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  {ingredient.weight.toFixed(2)}
                </td>
              </tr>
            );
          })}
          {/* Total weight row */}
          <tr className="bg-gray-100 font-bold">
            <td className="border border-gray-300 p-2">Total</td>
            <td className="border border-gray-300 p-2"></td>
            <td className="border border-gray-300 p-2">
              {totalWeight.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
      <PizzaExporter
        activeTab={activeTab}
        flourWeight={flourWeight}
        numberOfBalls={numberOfBalls}
        weightPerBall={weightPerBall}
        ingredients={ingredients}
        totalWeight={totalWeight}
      />
    </div>
  );
};

export default PizzaCalculator;