import React, { useState } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';

const PromptInput = () => {
  const [modelType, setModelType] = useState('3.5 Sonnet');

  return (
    <div className="mx-auto w-full max-w-2xl">
      <fieldset className="flex w-full min-w-0 flex-col">
        <div className="flex flex-col gap-1.5 border border-border-300 rounded-2xl pl-4 pt-2.5 pr-2.5 pb-2.5 bg-bg-000 shadow-sm hover:border-border-200 focus-within:border-border-200 transition-all">
          <div className="flex gap-2">
            <div className="mt-1 w-full overflow-y-auto break-words min-h-[4.5rem]">
              <div contentEditable className="break-words max-w-[60ch]" placeholder="How can Claude help you today?">
              </div>
            </div>
          </div>
          
          <div className="flex items-end">
            <div className="min-w-0 flex-1 flex max-sm:flex-col-reverse max-sm:gap-1.5 sm:items-center">
              <div className="flex min-w-0 min-h-4 flex-1 items-center pr-3">
                {/* Model Selector */}
                <button className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md hover:bg-bg-200 transition">
                  <svg className="h-3 w-auto" viewBox="0 0 139 34" fill="currentColor">
                    <path d="M18.07 30.79c-5.02 0-8.46-2.8-10.08-7.11a19.2 19.2 0 0 1-1.22-7.04C6.77 9.41 10 4.4 17.16 4.4c4.82 0 7.78 2.1 9.48 7.1h2.06l-.28-6.9c-2.88-1.86-6.48-2.81-10.87-2.81-6.16 0-11.41 2.77-14.34 7.74A16.77 16.77 0 0 0 1 18.2c0 5.53 2.6 10.42 7.5 13.15a17.51 17.51 0 0 0 8.74 2.06c4.78 0 8.57-.91 11.93-2.5l.87-7.62h-2.1c-1.26 3.48-2.76 5.57-5.25 6.68-1.22.55-2.76.83-4.62.83Z"/>
                  </svg>
                  <span className="whitespace-nowrap tracking-tight">{modelType}</span>
                  <svg className="w-3 h-3" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <Card className="from-bg-400/10 to-bg-400/30 border-border-300 -mt-1.5 rounded-b-xl">
          <div className="p-3">
            <div className="flex justify-between items-center gap-2">
              {/* File Upload Actions */}
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-bg-200 transition">
                  <Upload className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-bg-200 transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="p-1.5 rounded-md hover:bg-bg-200 transition">
                  <X className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-md hover:bg-bg-200 transition">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              {['Provide stakeholder perspective', 'Extract insights from report', 'Polish your prose'].map((text, i) => (
                <button key={i} className="bg-bg-300 border border-border-300 rounded-xl p-3 text-sm hover:bg-bg-200 transition text-left">
                  {text}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </fieldset>
    </div>
  );
};

export default PromptInput;