pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        ECR_REPO       = '992382473180.dkr.ecr.ap-south-1.amazonaws.com/jenkinstest1'
        IMAGE_TAG      = "build-${BUILD_NUMBER}"
        CONTAINER_NAME = 'jenkinstest1'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
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
                    echo "Image built: $ECR_REPO:$IMAGE_TAG"
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                echo 'Pushing image to AWS ECR...'
                sh '''
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO
                    docker push $ECR_REPO:$IMAGE_TAG
                    docker push $ECR_REPO:latest
                    echo "Image pushed successfully"
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Deploying container...'
                sh '''
                    # Login to ECR
                    aws ecr get-login-password --region $AWS_REGION | \
                    docker login --username AWS --password-stdin $ECR_REPO

                    # Pull latest image
                    docker pull $ECR_REPO:latest

                    # Stop and remove old container
                    docker stop $CONTAINER_NAME 2>/dev/null || true
                    docker rm $CONTAINER_NAME 2>/dev/null || true

                    # Run new container
                    docker run -d \
                        --name $CONTAINER_NAME \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        -e BUILD_NUMBER=$BUILD_NUMBER \
                        $ECR_REPO:latest

                    echo "Container deployed!"
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking app is live...'
                sh '''
                    sleep 5
                    curl -f http://localhost:3000/health || exit 1
                    echo "✅ Health check passed!"
                    docker ps | grep $CONTAINER_NAME
                '''
            }
        }
    }

    post {
        success {
            sh '''
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "✅ PIPELINE SUCCESS"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                docker ps --filter name=$CONTAINER_NAME
            '''
        }
        failure {
            echo '❌ Pipeline FAILED — check logs above'
        }
    }
}
