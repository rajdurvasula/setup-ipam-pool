import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { IPv4CidrRange } from 'ip-num/IPRange';
import { IPv4, Asn } from 'ip-num/IPNumber';

export class IpamStack extends Stack {
 
  central_pool1_range = IPv4CidrRange.fromCidr('10.0.0.0/8');
  cidr_12_increment: number = 1048576;
  cidr_14_increment: number = 262144;
  regions: string[] = [ 'eu-north-1', 'ca-central-1', 'ap-south-1', 'ap-southeast-2', 'eu-west-1', 'eu-west-3', 'us-east-2', 'us-west-2', 'ap-northeast-2', 'ap-southeast-1', 'eu-central-1', 'ap-northeast-1', 'sa-east-1', 'eu-west-2', 'us-east-1' ];
  current_cidr_start: number = 0;
  current_child_pool_start: number = 0;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    let regionJsonArray = [];
    for (var i in this.regions) {
      regionJsonArray.push({
        regionName: this.regions[i]
      });
    }

    // Create IPAM
    const cfnIPAM = new ec2.CfnIPAM(this, 'central-ipam1', {
      description: 'central network pool 1',
      operatingRegions: regionJsonArray,
      tags: [
        {
	  key: 'Owner',
	  value: 'rajasekhar.durvasula'
	}
      ]
    });
    // Create IPAM Pool 'central-pool1'
    const cfnIPAMPool = new ec2.CfnIPAMPool(this, 'central-pool1',  {
      addressFamily: 'ipv4',
      ipamScopeId: cfnIPAM.attrPrivateDefaultScopeId,
      allocationDefaultNetmaskLength: 28,
      allocationMaxNetmaskLength: 28,
      allocationMinNetmaskLength: 12,
      autoImport: true,
      description: 'central pool 1',
      provisionedCidrs: [
        {
	  cidr: '10.0.0.0/8'
	}
      ],
      tags: [
        {
	  key: 'Owner',
	  value: 'rajasekhar.durvasula'
	}
      ]
    });

    for (var i in this.regions) {
      this.create_regional_pool(this.regions[i], cfnIPAM.attrPrivateDefaultScopeId, cfnIPAMPool.attrIpamPoolId);
      this.current_cidr_start += this.cidr_12_increment;
    }
  }

  create_regional_pool(region: string, scopeId: string, parentPoolId: string) {
    //const new_cidr = '10.'+this.current_cidr_start+'.0.0/12';
    let centralPool1RangeSet = this.central_pool1_range.toRangeSet();
    let regionRangeSet = centralPool1RangeSet.takeSubRange(BigInt(this.current_cidr_start), BigInt(this.cidr_12_increment));
    let new_cidr = regionRangeSet.toCidrRange().toCidrString();
    const regionIPAMPool = new ec2.CfnIPAMPool(this, region+'-pool',{
      addressFamily: 'ipv4',
      ipamScopeId: scopeId,
      allocationDefaultNetmaskLength: 28,
      allocationMaxNetmaskLength: 28,
      allocationMinNetmaskLength: 14,
      description: region+' pool',
      locale: region,
      provisionedCidrs: [
        {
	  cidr: new_cidr
	}
      ],
      sourceIpamPoolId: parentPoolId,
      tags: [
        {
	  key: 'Owner',
	  value: 'rajasekhar.durvasula'
	}
      ]
    });
    let regionPoolRangeSet = IPv4CidrRange.fromCidr(new_cidr).toRangeSet();
    // create dev pools
    for (let i = 0; i < 1; i++) {
      let rangeSet1 = regionPoolRangeSet.takeSubRange(BigInt(this.current_child_pool_start), BigInt(this.cidr_14_increment));
      let dev_cidr = rangeSet1.toCidrRange().toCidrString();
      this.create_dev_pool(region, scopeId, regionIPAMPool.attrIpamPoolId, dev_cidr, (i+1));
      this.current_child_pool_start += this.cidr_14_increment;
    }
    // create prod pools
    for (let i = 0; i < 1; i++) {
      let rangeSet2 = regionPoolRangeSet.takeSubRange(BigInt(this.current_child_pool_start), BigInt(this.cidr_14_increment));
      let prod_cidr = rangeSet2.toCidrRange().toCidrString();
      this.create_prod_pool(region, scopeId, regionIPAMPool.attrIpamPoolId, prod_cidr, (i+1));
    }
    // reset childpool
    this.current_child_pool_start = 0;
  }

  create_dev_pool(region: string, scopeId: string, parentPoolId: string, dev_cidr: string, index: number) {
    const devIPAMPool = new ec2.CfnIPAMPool(this, region+'Dev-pool-'+index.toString(), {
      addressFamily: 'ipv4',
      ipamScopeId: scopeId,
      allocationDefaultNetmaskLength: 28,
      allocationMaxNetmaskLength: 28,
      allocationMinNetmaskLength: 24,
      description: region+' Dev pool '+index.toString(),
      locale: region,
      provisionedCidrs: [
        {
	  cidr: dev_cidr
	}
      ],
      sourceIpamPoolId: parentPoolId,
      tags: [
        {
          key: 'Owner',
	  value: 'rajasekhar.durvasula'
	}
      ]
    });
  }

  create_prod_pool(region: string, scopeId: string, parentPoolId: string, prod_cidr: string, index: number) {
    const prodIPAMPool = new ec2.CfnIPAMPool(this, region+'Prod-pool-'+index.toString(), {
      addressFamily: 'ipv4',
      ipamScopeId: scopeId,
      allocationDefaultNetmaskLength: 28,
      allocationMaxNetmaskLength: 28,
      allocationMinNetmaskLength: 24,
      description: region+' Prod pool '+index.toString(),
      locale: region,
      provisionedCidrs: [
        {
	  cidr: prod_cidr
	}
      ],
      sourceIpamPoolId: parentPoolId,
      tags: [
        {
          key: 'Owner',
	  value: 'rajasekhar.durvasula'
	}
      ]
    });
  }
}
