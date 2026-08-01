#!/bin/bash
echo "Bootstrapping HealthSense Workspace..."
pnpm install
pnpm run build
echo "Bootstrap complete."
