import * as cdk from 'aws-cdk-lib'
import * as lamda from 'aws-cdk-lib/aws-lambda'
import * as api from 'aws-cdk-lib/aws-apigateway'
import { HitCounter } from './hitcounter'
import { TableViewer } from 'cdk-dynamo-table-viewer'

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const hello = new lamda.Function(this, 'HelloHandler', {
      runtime: lamda.Runtime.NODEJS_14_X,
      code: lamda.Code.fromAsset('lamda'),
      handler: 'hello.handler',
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello,
    })

    const apigw = new api.LambdaRestApi(this, 'Gateway', {
      handler: helloWithCounter.handler,
    })
    new TableViewer(this, 'ViewHitCounter', {
      title: ' Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits',
    })
  }
}
