import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSankeyStore } from '../stores/sankeyStore';
import { PlusCircle, BarChart } from 'lucide-react';

export function Dashboard() {
  const { diagrams, loading, fetchDiagrams } = useSankeyStore();

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <div className="animate-bounce p-4 bg-white rounded-full shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-12">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 tracking-tight">
            <span className="inline-block animate-wiggle">🎨</span> Your Sankey Diagrams
          </h1>
          <Link
            to="/new"
            className="transform hover:scale-105 transition-transform duration-200 flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl"
          >
            <PlusCircle className="w-6 h-6 mr-2" />
            Create New Diagram
          </Link>
        </div>

        {diagrams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl p-8 transform hover:scale-102 transition-all duration-300">
            <BarChart className="w-24 h-24 mx-auto text-purple-400 mb-6 animate-float" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">No diagrams yet!</h2>
            <p className="text-gray-500 mb-8 text-lg">Time to create something awesome! 🚀</p>
            <Link
              to="/new"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlusCircle className="w-6 h-6 mr-2" />
              Create Your First Diagram
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diagrams.map((diagram) => (
              <Link
                key={diagram.id}
                to={`/diagram/${diagram.id}`}
                className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
                  <div className="w-full h-32 flex items-center justify-center">
                    <BarChart className="w-16 h-16 text-blue-500 group-hover:text-purple-500 transition-colors duration-200" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {diagram.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(diagram.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center text-blue-500 group-hover:text-purple-500 font-medium transition-colors duration-200">
                  View Diagram 
                  <span className="transform group-hover:translate-x-1 transition-transform duration-200 ml-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}