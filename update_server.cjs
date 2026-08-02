const fs = require('fs');

let serverCode = fs.readFileSync('./server.ts', 'utf-8');

serverCode = serverCode.replace(
  /if \(!apiKey\) \{[^}]+isAiGenerated:\s*false[^}]+\}/g,
  `if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }`
);

serverCode = serverCode.replace(
  /catch \(err\) \{[^}]+isAiGenerated:\s*false[^}]+\}/g,
  `catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }`
);

serverCode = serverCode.replace(
  /if \(!text\) \{[^}]+isAiGenerated:\s*false[^}]+\}/g,
  `if (!text) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }`
);

const newEndpoints = `
  // ==========================================
  // AGENTIC PIPELINE ENDPOINTS (NVIDIA NIM)
  // ==========================================

  app.post('/api/agents/orchestrate', async (req, res) => {
    try {
      const { text, audioBase64, patientId, patientProfile } = req.body;
      
      let inputText = text;
      
      if (audioBase64) {
        // dynamic require because ts-node compiles server.ts in commonjs
        const { callNvidiaASR } = require('./src/services/agents/nvidiaClient');
        const cleanAudio = audioBase64.replace(/^data:audio\\/\\w+;base64,/, '');
        inputText = await callNvidiaASR(cleanAudio);
      }
      
      if (!inputText) {
        return res.status(400).json({ error: 'No text or audio provided.' });
      }

      const { runIntakeAgent } = require('./src/services/agents/intakeAgent');
      const { runTriageAgent } = require('./src/services/agents/triageAgent');
      const { runActionOrchestrator } = require('./src/services/agents/actionOrchestrator');
      const { runEmpathyAgent } = require('./src/services/agents/empathyAgent');
      const { callNvidiaTTS } = require('./src/services/agents/nvidiaClient');

      console.log('Running Intake Agent...');
      const intake = await runIntakeAgent(inputText);
      
      const profile = patientProfile || {
        name: 'Ramesh',
        age: 55,
        gender: 'Male',
        conditions: ['Hypertension'],
      };

      console.log('Running Triage Agent...');
      const triage = await runTriageAgent(intake, profile);

      console.log('Running Action Orchestrator...');
      const orchestration = await runActionOrchestrator(triage, profile);

      console.log('Running Empathy Agent...');
      const spokenText = await runEmpathyAgent(triage);
      
      console.log('Running TTS...');
      let audio = null;
      try {
        audio = await callNvidiaTTS(spokenText);
      } catch (ttsErr) {
        console.error('TTS Failed:', ttsErr);
      }

      return res.json({
        intake,
        triage,
        orchestration,
        empathy: {
          spokenText,
          audioBase64: audio,
        }
      });
    } catch (err) {
      console.error('Agent Pipeline Error:', err);
      return res.status(500).json({ error: err.message || 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });
`;

serverCode = serverCode.replace('  // Vite middleware for development', newEndpoints + '\n  // Vite middleware for development');

fs.writeFileSync('./server.ts', serverCode);
console.log('Updated server.ts successfully');
