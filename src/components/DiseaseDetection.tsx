import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';

const diseaseDetectionSchema = z.object({
  image: z.string().min(1, 'Image is required'),
  cropType: z.string().min(1, 'Crop type is required'),
});

type DiseaseDetectionFormData = z.infer<typeof diseaseDetectionSchema>;

interface DetectionResult {
  disease: string;
  confidence: number;
  recommendations: string[];
}

export function DiseaseDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<DiseaseDetectionFormData>({
    resolver: zodResolver(diseaseDetectionSchema)
  });

  const onSubmit = async (data: DiseaseDetectionFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-disease`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      setResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Crop Disease Detection</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Crop Type</label>
          <select
            {...register('cropType')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select crop type</option>
            <option value="maize">Maize</option>
            <option value="wheat">Wheat</option>
            <option value="rice">Rice</option>
            <option value="potato">Potato</option>
            <option value="tomato">Tomato</option>
          </select>
          {errors.cropType && (
            <p className="mt-1 text-sm text-red-600">{errors.cropType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  register('image').onChange({
                    target: { value: base64 }
                  });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="mt-1 block w-full"
          />
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
          <p className="mb-2">
            <span className="font-medium">Disease:</span> {result.disease}
          </p>
          <p className="mb-2">
            <span className="font-medium">Confidence:</span> {(result.confidence * 100).toFixed(1)}%
          </p>
          <div>
            <span className="font-medium">Recommendations:</span>
            <ul className="list-disc list-inside mt-1">
              {result.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}