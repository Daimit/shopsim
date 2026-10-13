import React from 'react';

interface ProductSpecsProps {
  specsJson: string;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ specsJson }) => {
  let specs: Record<string, string> = {};

  try {
    specs = typeof specsJson === 'string' ? JSON.parse(specsJson) : specsJson;
  } catch {
    specs = { "Information": "Specifications not available" };
  }

  const entries = Object.entries(specs && typeof specs === 'object' && !Array.isArray(specs) ? specs : {});

  if (entries.length === 0) {
    return <p className="text-slate-500 text-sm">No specifications listed for this product.</p>;
  }

  return (
    <div className="overflow-hidden border border-slate-200 rounded-lg shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <tbody className="divide-y divide-slate-100 bg-white">
          {entries.map(([key, val], idx) => (
            <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
              <td className="px-6 py-3.5 font-semibold text-slate-700 w-1/3 whitespace-nowrap bg-slate-50/80">
                {key}
              </td>
              <td className="px-6 py-3.5 text-slate-600">
                {String(val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
