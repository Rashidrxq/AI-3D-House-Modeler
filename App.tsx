import React, { useState, useCallback } from 'react';
import { ModelObject } from './types';
import { generateHouseModel } from './services/geminiService';
import ModelViewer from './components/ModelViewer';

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="m3 21 9-9"/><path d="M12.2 6.8 11 8"/>
    </svg>
);

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A modern brick house with a dark tile roof and a wooden deck. Add warm interior lighting in the living room and a spotlight illuminating the front door.');
  const [modelObjects, setModelObjects] = useState<ModelObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const generatedObjects = await generateHouseModel(prompt);
      setModelObjects(generatedObjects);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setModelObjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col lg:flex-row">
      {/* Control Panel */}
      <aside className="w-full lg:w-96 p-6 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 flex flex-col space-y-6">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-100">AI 3D House Modeler</h1>
        </div>
        
        <div className="flex-grow flex flex-col space-y-4">
            <label htmlFor="prompt" className="text-sm font-medium text-gray-400">Describe the house you want to build:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A cozy log cabin with warm lights..."
              className="w-full h-40 p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none"
              disabled={isLoading}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              {isLoading ? <Spinner /> : <WandIcon />}
              <span>{isLoading ? 'Generating...' : 'Generate Model'}</span>
            </button>
            {error && <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        </div>

        <div className="text-xs text-gray-500">
            <p>Use your mouse to rotate, pan, and zoom the model. The AI will create a 3D model from simple building blocks based on your description.</p>
        </div>
      </aside>

      {/* 3D Viewer */}
      <main className="flex-1 min-h-0">
        {modelObjects.length > 0 ? (
          <ModelViewer modelObjects={modelObjects} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gray-800">
            <div className="max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h2 className="mt-4 text-2xl font-bold text-gray-300">Your 3D Model Awaits</h2>
                <p className="mt-2 text-gray-400">
                    Describe your dream house in the panel on the left and click "Generate Model" to bring it to life in this 3D space.
                </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;