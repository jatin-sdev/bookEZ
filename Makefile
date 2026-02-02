.PHONY: k8s-up k8s-down k8s-status k8s-logs

# "docker compose up" equivalent
k8s-up:
	@echo "🚀 Deploying to Kubernetes..."
	kubectl apply -f infra/k8s/
	@echo "⏳ Waiting for pods to be ready..."
	kubectl wait --for=condition=ready pod --all --timeout=300s || echo "⚠️  Some pods apply take longer to start. Check status with 'make k8s-status'"

# "docker compose down" equivalent
k8s-down:
	@echo "🛑 Removing Kubernetes resources..."
	kubectl delete -f infra/k8s/

# Check status
k8s-status:
	kubectl get pods,svc

# Tail logs (defaults to api, override with SERVICE=tf-web)
k8s-logs:
	kubectl logs -l app=$(or $(SERVICE),tf-api) -f
