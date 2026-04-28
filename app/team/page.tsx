'use client';

import { useState } from 'react';

export default function Team() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'nightcircle',
      name: 'NightCircle',
      role: 'Orchestrator',
      color: 'from-[#5E6AD2] to-[#8B5CF6]',
      status: 'active',
      description: 'Routing and coordination',
      responsibilities: [
        'Analyze incoming requests',
        'Route to specialist agents',
        'Combine multi-agent outputs',
        'Quality assurance',
      ],
      whenToEngage: [
        'Multi-agent coordination',
        'Complex workflows',
        'Final synthesis',
        'Team management',
      ],
    },
    {
      id: 'signal',
      name: 'Signal',
      role: 'Researcher',
      color: 'from-[#34C759] to-[#30D158]',
      status: 'ready',
      description: 'Intelligence + content',
      responsibilities: [
        'Gather research and context',
        'Summarize insights',
        'Create written content',
        'Trend analysis',
      ],
      whenToEngage: [
        '"Research X for me"',
        '"Write a post about..."',
        '"Summarize this..."',
        '"What\'s trending in..."',
      ],
    },
    {
      id: 'vector',
      name: 'Vector',
      role: 'Analyst',
      color: 'from-[#FF9500] to-[#FF6B00]',
      status: 'ready',
      description: 'Data and insights',
      responsibilities: [
        'Data analysis',
        'Pattern recognition',
        'Strategic recommendations',
        'Performance review',
      ],
      whenToEngage: [
        '"Analyze this data..."',
        '"What should I prioritize?"',
        '"Review performance..."',
        '"Identify trends..."',
      ],
    },
    {
      id: 'anchor',
      name: 'Anchor',
      role: 'Chief of Staff',
      color: 'from-[#007AFF] to-[#0055B3]',
      status: 'ready',
      description: 'Operations',
      responsibilities: [
        'Task tracking',
        'Goal breakdown',
        'Priority setting',
        'Workflow optimization',
      ],
      whenToEngage: [
        '"Help me plan..."',
        '"What\'s my focus today?"',
        '"Break this into steps..."',
        '"Track my progress..."',
      ],
    },
    {
      id: 'engine',
      name: 'Engine',
      role: 'Builder',
      color: 'from-[#BF5AF2] to-[#9F40E0]',
      status: 'ready',
      description: 'Execution',
      responsibilities: [
        'Build deliverables',
        'Solve technical problems',
        'Create tools and systems',
        'Debug and fix issues',
      ],
      whenToEngage: [
        '"Build me a..."',
        '"Fix this bug..."',
        '"Create a tool for..."',
        '"Implement X..."',
      ],
    },
  ];

  const activeAgent = agents.find(a => a.status === 'active');

  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto">
      {/* Team Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#E3E3E3] mb-2">AI Dream Team</h2>
        <p className="text-sm text-[#8E8E93]">
          Specialized agents coordinated by NightCircle. Each agent has a distinct role and stays in their lane.
        </p>
      </div>

      {/* Active Agent Banner */}
      {activeAgent && (
        <div className="mb-6 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeAgent.color} flex items-center justify-center`}>
              <span className="text-sm font-bold text-white">{activeAgent.name[0]}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#E3E3E3]">{activeAgent.name}</p>
              <p className="text-xs text-[#8E8E93]">{activeAgent.role} · Currently orchestrating</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
            <span className="text-xs text-[#34C759]">Active</span>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            className={`bg-[#0A0A0A] border rounded-lg p-4 cursor-pointer transition-all ${
              selectedAgent === agent.id
                ? 'border-[#5E6AD2] bg-[#141414]'
                : 'border-[#1F1F1F] hover:border-[#2A2A2A]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                <span className="text-sm font-bold text-white">{agent.name[0]}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                agent.status === 'active'
                  ? 'bg-[#34C759]/20 text-[#34C759]'
                  : 'bg-[#3A3A3C]/20 text-[#8E8E93]'
              }`}>
                {agent.status === 'active' ? 'Active' : 'Ready'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-[#E3E3E3] mb-1">{agent.name}</h3>
            <p className="text-xs text-[#8E8E93] mb-3">{agent.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8E8E93] uppercase tracking-wide">{agent.role}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail */}
      {selectedAgent && (
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
          {(() => {
            const agent = agents.find(a => a.id === selectedAgent)!;
            return (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                    <span className="text-lg font-bold text-white">{agent.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#E3E3E3]">{agent.name}</h3>
                    <p className="text-sm text-[#8E8E93]">{agent.role} · {agent.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">Responsibilities</h4>
                    <ul className="space-y-2">
                      {agent.responsibilities.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#E3E3E3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2]"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-[#8E8E93] uppercase tracking-wide mb-3">When to Engage</h4>
                    <ul className="space-y-2">
                      {agent.whenToEngage.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#E3E3E3]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                          <code className="text-xs bg-[#141414] px-2 py-0.5 rounded">{item}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Workflow Info */}
      <div className="mt-6 bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-6">
        <h3 className="text-sm font-medium text-[#E3E3E3] mb-4">Workflow</h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">1. NightCircle analyzes request</span>
          </div>
          <span className="text-[#8E8E93]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">2. Assigns specialist agent</span>
          </div>
          <span className="text-[#8E8E93]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">3. Agent executes task</span>
          </div>
          <span className="text-[#8E8E93]">→</span>
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E93]">4. NightCircle combines results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
