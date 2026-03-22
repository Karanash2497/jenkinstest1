pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        ECR_REPO       = 'YOUR_ECR_URI/jenkinstest1'
        IMAGE_TAG      = "build-${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Building branch: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'node test.js'
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                sh '''
                    docker build -t $ECR_REPO:$IMAGE_TAG .
                    docker tag $ECR_REPO:$IMAGE_TAG $ECR_REPO:latest
                    echo "Built: $ECR_REPO:$IMAGE_TAG"
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                echo 'Pushing to ECR...'
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO
                    docker push $ECR_REPO:$IMAGE_TAG
                    docker push $ECR_REPO:latest
                '''
            }
        }

        // ── DEV DEPLOY ──
        stage('Deploy to Dev') {
            when {
                branch 'develop'
            }
            steps {
                echo 'Deploying to DEV environment...'
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO

                    docker pull $ECR_REPO:latest
                    docker stop app-dev 2>/dev/null || true
                    docker rm app-dev 2>/dev/null || true

                    docker run -d \
                        --name app-dev \
                        --restart unless-stopped \
                        -p 3001:3000 \
                        -e APP_ENV=dev \
                        -e BUILD_NUMBER=$BUILD_NUMBER \
                        $ECR_REPO:latest

                    echo "Dev deployed on port 3001"
                '''
            }
        }

        // ── STAGING DEPLOY ──
        stage('Deploy to Staging') {
            when {
                branch 'staging'
            }
            steps {
                echo 'Deploying to STAGING environment...'
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO

                    docker pull $ECR_REPO:latest
                    docker stop app-staging 2>/dev/null || true
                    docker rm app-staging 2>/dev/null || true

                    docker run -d \
                        --name app-staging \
                        --restart unless-stopped \
                        -p 3002:3000 \
                        -e APP_ENV=staging \
                        -e BUILD_NUMBER=$BUILD_NUMBER \
                        $ECR_REPO:latest

                    echo "Staging deployed on port 3002"
                '''
            }
        }

        // ── PROD DEPLOY WITH APPROVAL ──
        stage('Approval for Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Waiting for production approval...'
                timeout(time: 10, unit: 'MINUTES') {
                    input message: 'Deploy to PRODUCTION?',
                          ok: 'Yes, Deploy!',
                          submitter: 'admin'
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to PRODUCTION...'
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO

                    docker pull $ECR_REPO:latest
                    docker stop app-prod 2>/dev/null || true
                    docker rm app-prod 2>/dev/null || true

                    docker run -d \
                        --name app-prod \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        -e APP_ENV=production \
                        -e BUILD_NUMBER=$BUILD_NUMBER \
                        $ECR_REPO:latest

                    echo "Production deployed on port 3000"
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Running health check...'
                sh '''
                    sleep 5
                    if [ "$BRANCH_NAME" = "develop" ]; then
                        curl -f http://localhost:3001/health || exit 1
                        echo "Dev health check passed!"
                    elif [ "$BRANCH_NAME" = "staging" ]; then
                        curl -f http://localhost:3002/health || exit 1
                        echo "Staging health check passed!"
                    elif [ "$BRANCH_NAME" = "main" ]; then
                        curl -f http://localhost:3000/health || exit 1
                        echo "Production health check passed!"
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS on branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline FAILED on branch: ${env.BRANCH_NAME}"
        }
    }
}
