#!/bin/bash

NAMESPACE="workshop"
LOG_DIR="/tmp"
PID_FILE="/tmp/workshop-port-forward.pids"

# Arrêter d'anciens port-forwards éventuels
if [ -f "$PID_FILE" ]; then
  echo "Arrêt des anciens port-forwards..."
  xargs kill 2>/dev/null < "$PID_FILE"
  rm -f "$PID_FILE"
fi

# Vérifier que minikube tourne
if ! minikube status >/dev/null 2>&1; then
  echo "❌ Minikube n'est pas démarré (minikube start)"
  exit 1
fi

start_forward() {
  local name=$1 local_port=$2 svc_port=$3

  minikube kubectl -- port-forward --address 0.0.0.0 \
    "svc/$name" "$local_port:$svc_port" -n "$NAMESPACE" \
    >"$LOG_DIR/$name-port-forward.log" 2>&1 &

  local pid=$!
  echo "$pid" >> "$PID_FILE"
  echo "✓ $name : http://localhost:$local_port (PID: $pid, logs: $LOG_DIR/$name-port-forward.log)"
}

start_forward grafana  3000 3000
start_forward backend  3001 3000
start_forward frontend 8080 80
start_forward ia       8081 8080

sleep 2

echo ""
echo "Vérification des processus :"
while read -r pid; do
  if kill -0 "$pid" 2>/dev/null; then
    echo "  PID $pid : actif"
  else
    echo "  PID $pid : ❌ arrêté (consultez les logs)"
  fi
done < "$PID_FILE"

echo ""
echo "Pour tout arrêter : xargs kill < $PID_FILE && rm $PID_FILE"