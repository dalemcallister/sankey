import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SankeyDiagram } from '../components/Sankey/SankeyDiagram';
import { Printer, ArrowLeft, Edit } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import type { SankeyData } from '../lib/supabase';

export function DiagramView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diagram, setDiagram] = useState<SankeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiagram() {
      try {
        const { data, error } = await supabase
          .from('sankey_diagrams')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDiagram(data);
      } catch (err) {
        console.error('Error fetching diagram:', err);
        setError('Failed to load diagram');
      } finally {
        setLoading(false);
      }
    }

    fetchDiagram();
  }, [id]);

  const handlePrint = async () => {
    if (!diagram) return;
    try {
      await exportToPDF(diagram.name);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">{error || 'Diagram not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold">{diagram.name}</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(`/edit/${diagram.id}`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <SankeyDiagram
          nodes={diagram.nodes}
          links={diagram.links}
          width={800}
          height={600}
        />
      </div>
    </div>
  );
}