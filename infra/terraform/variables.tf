variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short project identifier used in resource names"
  type        = string
  default     = "shopmart"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "container_port" {
  description = "Port the application listens on inside the container"
  type        = number
  default     = 5001
}

variable "service_desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "task_cpu" {
  description = "Fargate task CPU units"
  type        = string
  default     = "256"
}

variable "task_memory" {
  description = "Fargate task memory (MiB)"
  type        = string
  default     = "512"
}

variable "image_tag" {
  description = "Container image tag deployed by ECS (set by CI/CD)"
  type        = string
  default     = "latest"
}
