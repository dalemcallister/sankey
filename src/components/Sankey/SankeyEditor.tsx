import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SankeyDiagram } from './SankeyDiagram';
import { useSankeyStore } from '../../stores/sankeyStore';
import { supabase } from '../../lib/supabase';
import { Printer, Save, ArrowLeft } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';
import { detectCycle } from '../../utils/sankeyValidation';
import type { SankeyLink } from '../../types/sankey';

export function SankeyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [nodes, setNodes] = useState<string[]>(['Node 1', 'Node 2']);
  const [links, setLinks] = useState<SankeyLink[]>([{ source: 0, target: 1, value: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const saveDiagram = useSankeyStore((state) => state.saveDiagram);

  useEffect(() => {
    async function fetchDiagram() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('sankey_diagrams')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setName(data.name);
        setNodes(data.nodes);
        setLinks(data.links);
      } catch (err) {
        console.error('Error fetching diagram:', err);
        setError('Failed to load diagram');
      }
    }

    fetchDiagram();
  }, [id]);

  const handleNodeChange = (index: number, value: string) => {
    const newNodes = [...nodes];
    newNodes[index] = value;
    setNodes(newNodes);
  };

  const handleLinkChange = (index: number, field: keyof SankeyLink, value: number) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    
    if (!detectCycle(nodes, newLinks)) {
      setLinks(newLinks);
      setError(null);
    } else {
      setError('Circular links are not allowed');
    }
  };

  const addNode = () => {
    setNodes([...nodes, `Node ${nodes.length + 1}`]);
  };

  const addLink = () => {
    setLinks([...links, { source: 0, target: 1, value: 1 }]);
  };

  const removeNode = (index: number) => {
    const newNodes = nodes.filter((_, i) => i !== index);
    const newLinks = links.filter(
      link => link.source !== index && link.target !== index
    ).map(link => ({
      ...link,
      source: link.source > index ? link.source - 1 : link.source,
      target: link.target > index ? link.target - 1 : link.target
    }));
    setNodes(newNodes);
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the diagram');
      return;
    }

    try {
      await saveDiagram({ name, nodes, links });
      navigate('/');
    } catch (err) {
      console.error('Error saving diagram:', err);
      setError('Failed to save diagram');
    }
  };

  const handlePrint = async () => {
    try {
      await exportToPDF(name || 'Sankey Diagram');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Diagram Name"
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Nodes</h2>
            {nodes.map((node, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={node}
                  onChange={(e) => handleNodeChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeNode(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addNode}
              className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add Node
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Links</h2>
            {links.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <select
                  value={link.source}
                  onChange={(e) => handleLinkChange(index, 'source', parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {nodes.map((node, i) => (
                    <option key={i} value={i}>{node}</option>
                  ))}
                </select>
                <span>→</span>
                <select
                  value={link.target}
                  onChange={(e) => handleLinkChange(index, 'target', parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {nodes.map((node, i) => (
                    <option key={i} value={i}>{node}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={link.value}
                  onChange={(e) => handleLinkChange(index, 'value', parseInt(e.target.value))}
                  min="1"
                  className="w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeLink(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add Link
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <SankeyDiagram
            nodes={nodes}
            links={links}
            width={800}
            height={600}
          />
        </div>
      </div>
    </div>
  );
}