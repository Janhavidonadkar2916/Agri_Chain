import React from 'react';
import { Cpu, Wifi, MapPin, Scale, Thermometer, Droplets, Radio, Brain, TrendingUp, Layers, Info } from 'lucide-react';

export default function FutureScopePage() {
  const hardwareItems = [
    {
      title: "ESP32 Microcontroller Integration",
      icon: Cpu,
      category: "IoT Hardware",
      desc: "Embedded Wi-Fi & BLE microcontrollers attached to grain containers for automated sensor payload transmission.",
      status: "Concept Architecture"
    },
    {
      title: "Real-Time GPS Tracking Module",
      icon: MapPin,
      category: "Logistics IoT",
      desc: "Live satellite location telemetry transmitting vehicle speeds, route diversions, and transit stops.",
      status: "Hardware Planned"
    },
    {
      title: "Smart Load Cell Weight Sensor",
      icon: Scale,
      category: "Farm Automation",
      desc: "Digital strain-gauge scales for automated harvest weight verification without manual input.",
      status: "Roadmap Q4"
    },
    {
      title: "Cold Chain Temperature Sensor",
      icon: Thermometer,
      category: "Quality Assurance",
      desc: "Real-time thermal monitoring for perishables with automatic smart contract breach alerts.",
      status: "Prototypes Active"
    },
    {
      title: "Grain Humidity & Moisture Sensor",
      icon: Droplets,
      category: "Quality Control",
      desc: "Relative humidity probes ensuring grain moisture stays under 12% to prevent mold growth.",
      status: "Concept Architecture"
    },
    {
      title: "Automated RFID Tag Scanners",
      icon: Radio,
      category: "Warehouse Logistics",
      desc: "Ultra-High Frequency (UHF) RFID gates automatically logging pallet movements into warehouse racks.",
      status: "Roadmap Q4"
    },
    {
      title: "AI Crop Disease & Grade Classifier",
      icon: Brain,
      category: "Computer Vision AI",
      desc: "Deep learning neural network scanning crop photos to auto-grade quality and detect leaf blight.",
      status: "Research Phase"
    },
    {
      title: "Predictive Supply Chain Analytics",
      icon: TrendingUp,
      category: "Machine Learning",
      desc: "Predictive algorithms forecasting regional harvest yields, spoilage rates, and price fluctuations.",
      status: "AI Integration"
    },
    {
      title: "Agricultural Digital Twin Model",
      icon: Layers,
      category: "Simulation Engine",
      desc: "Virtual 3D supply chain simulation matching physical crop batches in real time.",
      status: "Future Research"
    }
  ];

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300">
          <Cpu className="w-4 h-4 text-amber-600" />
          Hardware & Innovation Roadmap
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Future Hardware & IoT Integration Scope
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Exploring upcoming hardware sensors, ESP32 microcontrollers, RFID gates, and AI models designed to extend AgriChain's automated trust boundary.
        </p>
      </div>

      {/* Info Callout */}
      <div className="glass-card p-5 bg-gradient-to-r from-amber-500/10 via-agri-500/10 to-transparent border-l-4 border-l-amber-500 flex items-start gap-4">
        <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-100 font-bold block mb-1">
            Note for Project Evaluators & Reviewers:
          </strong>
          In the current core release, all supply chain state updates occur manually through web application forms and QR code scanning. Hardware sensors (ESP32, GPS, Temperature, Load Cells) represent our Phase 2 development roadmap and are displayed here as design specifications.
        </div>
      </div>

      {/* Grid of Hardware Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hardwareItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="glass-card p-6 border border-slate-100 dark:border-slate-800 hover:border-amber-400/80 transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-200 dark:border-amber-800 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {item.category}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Roadmap Status:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
