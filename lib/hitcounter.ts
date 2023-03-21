import * as cdk from 'aws-cdk-lib'
import * as lamda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

import { Construct } from 'constructs'

export interface HitCounterProps {
  downstream: lamda.IFunction
}

export class HitCounter extends Construct {
  public readonly handler: lamda.Function
  public readonly table: dynamodb.Table
  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id)
    const table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    this.table = table

    this.handler = new lamda.Function(this, 'HitsCounterHandler', {
      runtime: lamda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lamda.Code.fromAsset('lamda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: table.tableName,
      },
    })
    table.grantReadWriteData(this.handler)

    props.downstream.grantInvoke(this.handler)
  }
}
