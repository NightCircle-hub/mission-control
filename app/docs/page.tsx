'use client';

export default function Docs() {
  const categories = [
    { name: 'Agents', items: ['NightCircle', 'Signal', 'Vector', 'Engine', 'Beacon'] },
    { name: 'Skills', items: ['Weather', 'Slack', 'TaskFlow', 'Healthcheck'] },
    { name: 'Config', items: ['AGENTS.md', 'SOUL.md', 'USER.md', 'TOOLS.md'] },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Documentation</h1>
        <p className="text-gray-400 mb-6">Your knowledge base</p>
        
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-[#1E293B] rounded-lg p-4">
              <h3 className="font-semibold mb-3">{cat.name}</h3>
              <div className="space-y-2">
                {cat.items.map((item) => (
                  <div key={item} className="text-sm text-blue-400">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
