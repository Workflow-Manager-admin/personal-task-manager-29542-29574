#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-task-manager-29542-29574/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

