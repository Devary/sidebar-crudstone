def DEFAULT_APP_NAME = 'sidebar-crudstone'
def LIBRARY_NPM_NAME = 'sidebarcrudstone'
def LIBRARY_REGISTRY = 'https://registry.npmjs.org/'

def resolvePackageVersion(script) {
    return script.sh(script: "node -p \"require('./package.json').version\"", returnStdout: true).trim()
}

def resolveLibraryVersion(script) {
    return script.sh(script: "node -p \"require('./projects/sidebarcrudstone/package.json').version\"", returnStdout: true).trim()
}

def resolvePublishedLibraryVersion(script, npmName, registry) {
    // empty result (not an error) when the package/version was never published — first publish
    return script.sh(
        script: "npm view ${npmName} version --registry ${registry} 2>/dev/null || true",
        returnStdout: true
    ).trim()
}

pipeline {
    agent any

    parameters {
        booleanParam(name: 'SKIP_TESTS', defaultValue: true, description: 'Skip frontend test execution')
        booleanParam(name: 'PACKAGE_ONLY', defaultValue: false, description: 'Build + Docker only, skip Rundeck deployment')
        string(name: 'REPLICAS', defaultValue: '1', description: 'Desired number of pods')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        NG = './node_modules/.bin/ng'
        NPM_TOKEN = credentials('npm-publish-token')
        APP_NAME = "${DEFAULT_APP_NAME}"
        APP_PORT = '5901'
        RUNDECK_INSTANCE = 'local-rundeck'
        RUNDECK_JOB_ID = '1b180a49-b61b-4733-877e-03f3ea9f6939'
        NAMESPACE = 'default'
        HARBOR_REGISTRY = '192.168.178.41:30002'
        HARBOR_PROJECT = 'library'
        K8S_VAULT_URL = 'http://192.168.178.41:8200'
        VAULT_KV_MOUNT = 'kv'
        JWT_ISSUER = 'http://192.168.178.41:8081/realms/dev'
        KEYCLOAK_TOKEN_URL = 'http://192.168.178.41:8081/realms/dev/protocol/openid-connect/token'
        KEYCLOAK_CLIENT_ID = 'sidebar-crudstone'
        GATEWAY_AUTH_ENABLED = 'false'
        INFRA_REPO_URL = 'https://github.com/Devary/infra.git'
        INFRA_REPO_BRANCH = 'main'
        VAULT_SECRET_PATH = "${DEFAULT_APP_NAME}"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                sh 'npm test -- --watch=false'
            }
        }

        stage('Build') {
            steps {
                sh '$NG build sidebar-crudstone'
            }
        }

        stage('Check Library Version') {
            steps {
                script {
                    def localVersion = resolveLibraryVersion(this)
                    def publishedVersion = resolvePublishedLibraryVersion(this, LIBRARY_NPM_NAME, LIBRARY_REGISTRY)

                    echo "sidebarcrudstone local version:    ${localVersion}"
                    echo "sidebarcrudstone published version: ${publishedVersion ?: '(none published yet)'}"

                    env.LIBRARY_VERSION = localVersion
                    env.SHOULD_PUBLISH_LIBRARY = (localVersion != publishedVersion) ? 'true' : 'false'
                }
            }
        }

        stage('Build Library') {
            when {
                expression { env.SHOULD_PUBLISH_LIBRARY == 'true' }
            }
            steps {
                sh '$NG build sidebarcrudstone'
            }
        }

        stage('Publish Library') {
            when {
                expression { env.SHOULD_PUBLISH_LIBRARY == 'true' }
            }
            steps {
                sh '''
                    set -euo pipefail
                    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > dist/sidebarcrudstone/.npmrc
                    cd dist/sidebarcrudstone
                    npm publish
                '''
                echo "Published ${LIBRARY_NPM_NAME}@${env.LIBRARY_VERSION}"
            }
        }

        stage('Prepare Image Vars') {
            when {
                expression { !params.PACKAGE_ONLY }
            }
            steps {
                script {
                    def imageTag = resolvePackageVersion(this)
                    def imageName = "${env.HARBOR_REGISTRY}/${env.HARBOR_PROJECT}/${env.APP_NAME}"

                    sh 'mkdir -p target'
                    writeFile file: 'target/.image-vars', text: """IMAGE_TAG=${imageTag}
IMAGE_NAME=${imageName}
DOCKERFILE=Dockerfile
"""
                    sh 'cat target/.image-vars'
                }
            }
        }

        stage('Docker Image Push') {
            when {
                expression { !params.PACKAGE_ONLY }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'harbor-creds',
                    usernameVariable: 'HARBOR_USER',
                    passwordVariable: 'HARBOR_PASS'
                )]) {
                    sh '''
                        set -euo pipefail
                        . target/.image-vars
                        echo "$HARBOR_PASS" | docker login "$HARBOR_REGISTRY" -u "$HARBOR_USER" --password-stdin
                        docker build -f "$DOCKERFILE" -t "$IMAGE_NAME:$IMAGE_TAG" -t "$IMAGE_NAME:latest" .
                        docker push "$IMAGE_NAME:$IMAGE_TAG"
                        docker push "$IMAGE_NAME:latest"
                    '''
                }
            }
        }

        stage('Checkout Infra') {
            when {
                expression { !params.PACKAGE_ONLY }
            }
            steps {
                dir('infra') {
                    deleteDir()
                    git branch: env.INFRA_REPO_BRANCH, url: env.INFRA_REPO_URL
                }
            }
        }

        stage('Rundeck Job') {
            when {
                expression { !params.PACKAGE_ONLY }
            }
            steps {
                script {
                    def imageVars = [:]
                    readFile('target/.image-vars').split('\n').each { line ->
                        if (line?.trim() && line.contains('=')) {
                            def (key, value) = line.split('=', 2)
                            imageVars[key.trim()] = value.trim()
                        }
                    }

                    if (!env.RUNDECK_JOB_ID?.trim()) {
                        error('RUNDECK_JOB_ID environment value is required for deployment runs')
                    }

                    def infraWorkspace = "${env.WORKSPACE}/infra"
                    def ingressHost = "${env.APP_NAME}.192.168.178.41.nip.io"

                    def rundeckOptions = """image=${imageVars['IMAGE_NAME']}
tag=${imageVars['IMAGE_TAG']}
projectVersion=${imageVars['IMAGE_TAG']}
namespace=${env.NAMESPACE}
deployment=${env.APP_NAME}
container=${env.APP_NAME}
port=${env.APP_PORT}
replicas=${params.REPLICAS}
vaultUrl=${env.K8S_VAULT_URL}
vaultKvMount=${env.VAULT_KV_MOUNT}
vaultSecretPath=${env.VAULT_SECRET_PATH}
vaultBootstrap=true
serviceAccount=${env.APP_NAME}
ingressHost=${ingressHost}
workspace=${infraWorkspace}
jwtIssuer=${env.JWT_ISSUER}
keycloakTokenUrl=${env.KEYCLOAK_TOKEN_URL}
keycloakClientId=${env.KEYCLOAK_CLIENT_ID}
gatewayAuthEnabled=${env.GATEWAY_AUTH_ENABLED}
""".stripIndent().trim()

                    step([$class: 'RundeckNotifier',
                        rundeckInstance: env.RUNDECK_INSTANCE,
                        jobId: env.RUNDECK_JOB_ID,
                        options: rundeckOptions,
                        shouldWaitForRundeckJob: true,
                        shouldFailTheBuild: true,
                        includeRundeckLogs: true,
                        tailLog: true
                    ])
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout ${HARBOR_REGISTRY} || true'
            sh 'rm -f dist/sidebarcrudstone/.npmrc || true'
        }
    }
}
