pipeline {
    agent any

    tools{
        nodejs 'node'
    }

    parameters {
        choice(name: 'DEPLOY_STAGE', choices: ['staging', 'production'], description: 'Select the deployment stage')
        string(name: 'ARTIFACTS_BUCKET', defaultValue: 'my-artifacts-bucket', description: 'Enter the S3 bucket for artifacts')
        string(name: 'ARTIFACTS_PREFIX', defaultValue: 'my-prefix', description: 'Enter the S3 prefix for artifacts')
    }

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        STACK_NAME         = "book-app-${params.DEPLOY_STAGE}"
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }

    stages {
        stage('Unit Test') {
            steps {
                script {
                    sh "npm i -g recursive-install"
                    sh "npm-recursive-install --rootDir=src"
                    dir("src/books/create") {
                        sh "npm test"
                    }
                    dir("src/books/get-all") {
                        sh "npm test"
                    }
                }
            }
        }
        
        stage('Package Application') {
            steps {
                script {
                        sh "sam build"
                        sh "sam package --s3-bucket ${params.ARTIFACTS_BUCKET} --s3-prefix ${params.ARTIFACTS_PREFIX} --output-template-file template.yml"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                        sh "sam deploy --template-file template.yml --stack-name $STACK_NAME --parameter-overrides ParameterKey=Stage,ParameterValue=${params.DEPLOY_STAGE} --capabilities CAPABILITY_IAM"
                }
            }
        }
    }
}
