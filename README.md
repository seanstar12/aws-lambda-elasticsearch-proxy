# aws-lambda-elasticsearch-proxy

A simple proxy using AWS Lambda and AWS API Gateway.
Below are my configurations to get this into a working state.
This is not secured; it is wide open and needs more to secure
either by APU gateway or custom code inside this lambda.

#### IAM > Roles > elasticsearch-admin
I have attached the `elasticsearch-all-perms` policy to this role.

#### IAM > Policies > elasticsearch-all-perms

```JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "es:ESHttpGet",
        "es:ESHttpPost",
        "es:ESHttpPut",
        "es:ESHttpDelete",
        "es:ESHttpHead"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

#### Elasticsearch Access Policy

```JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": [
        "es:ESHttpGet",
        "es:ESHttpPost",
        "es:ESHttpDelete",
        "es:ESHttpHead"
      ],
      "Resource": [
        "arn:aws:es:us-east-1:XXXXXXXXXXXXX:domain/es-instance/es-index/es-doc-type/*"
      ]
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "es:ESHttpGet",
      "Resource": [
        "arn:aws:es:us-east-1:XXXXXXXXXXXX:domain/es-instance/es-index/posts/*",
      ]
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "es:ESHttpPost",
      "Resource": [
        "arn:aws:es:us-east-1:XXXXXXXXXXXX:domain/es-instance/es-index/*/_search",
        "arn:aws:es:us-east-1:XXXXXXXXXXXX:domain/es-instance/es-index/*/_msearch"
      ]
    },
  ]
}
```

#### API Gateway Config

```JSON
{
  "swagger": "2.0",
  "info": {
    "version": "2016-10-27T00:09:11Z",
    "title": "some-application"
  },
  "host": "XXXXXX.execute-api.us-east-1.amazonaws.com",
  "basePath": "/env",
  "schemes": [
    "https"
  ],
  "paths": {
    "/{proxy+}": {
      "x-amazon-apigateway-any-method": {
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "proxy",
            "in": "path",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "200 response",
            "schema": {
              "$ref": "#/definitions/Empty"
            }
          }
        },
        "x-amazon-apigateway-integration": {
          "responses": {
            "default": {
              "statusCode": "200"
            }
          },
          "uri": "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:############:function:some-application/invocations",
          "passthroughBehavior": "when_no_match",
          "httpMethod": "POST",
          "cacheNamespace": "ee5044",
          "cacheKeyParameters": [
            "method.request.path.proxy"
          ],
          "type": "aws_proxy"
        }
      }
    }
  },
  "definitions": {
    "Empty": {
      "type": "object",
      "title": "Empty Schema"
    }
  }
}
```

