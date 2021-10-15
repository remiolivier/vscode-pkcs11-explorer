import * as graphene from 'graphene-pk11';

export class NodeType {
	public static readonly Module = "module"; 
	public static readonly Slot = "slot"; 
	public static readonly ObjectType = "type";
	public static readonly CertificateObject = "CERTIFICATE";
	public static readonly PublicKeyObject = "PUBLIC_KEY";
	public static readonly PrivateKeyObject = "PRIVATE_KEY";
	public static readonly DataObject = "DATA";
	public static readonly SecretKeyObject = "SECRET_KEY";
}

export class AesEncryptDecryptAlgorithms {
	public static readonly AesCbc = "AES_CBC";
	public static readonly AesCbcPad = "AES_CBC_PAD";
	public static readonly AesCcm = "AES_CCM";
	public static readonly AesGcm = "AES_GCM";
}

export class RsaEncryptDecryptAlgorithms {
	public static readonly RsaOaep = "RSA_PKCS_OAEP";
	public static readonly RsaPkcs = "RSA_PKCS";
}

const TYPE_NUMBER = "number";
const TYPE_BOOL = "boolean";
const TYPE_STRING = "string";
const TYPE_BUFFER = "buffer";
const TYPE_DATE = "date";

export class Definitions {
	public static readonly BasicTemplate: graphene.ITemplate = {
		id: null,
		label: null
	};

	public static readonly CertificateTemplate:  graphene.ITemplate = {
		id: null,
		label: null,
		certType: null
	};

	public static readonly PrivateKeyTemplate:  graphene.ITemplate = {
		id: null,
		label: null,
		keyType: null
	};

	public static readonly ObjectTypesMap: Map<string, string> = new Map<string, string>([ 
		["Certificates", NodeType.CertificateObject],
		["Data", NodeType.DataObject],
		["Public keys", NodeType.PublicKeyObject],
		["Private keys", NodeType.PrivateKeyObject],
		["Secret keys", NodeType.SecretKeyObject]
	]);

	public static readonly ObjectTypeTemplateMap: Map<graphene.ObjectClass, graphene.ITemplate> = new Map<graphene.ObjectClass, graphene.ITemplate>([ 
		[graphene.ObjectClass.CERTIFICATE, Definitions.CertificateTemplate],
		[graphene.ObjectClass.DATA, Definitions.BasicTemplate],
		[graphene.ObjectClass.PUBLIC_KEY, Definitions.BasicTemplate],
		[graphene.ObjectClass.PRIVATE_KEY, Definitions.PrivateKeyTemplate],
		[graphene.ObjectClass.SECRET_KEY, Definitions.PrivateKeyTemplate]
	]);

	public static readonly ObjectClassToType: Map<graphene.ObjectClass, string> = new Map<graphene.ObjectClass, string>([
		[graphene.ObjectClass.CERTIFICATE, "CertType"],
		[graphene.ObjectClass.PRIVATE_KEY, "KeyType"],
		[graphene.ObjectClass.SECRET_KEY, "KeyType"]
	]);

	public static readonly SupportedDigestAlgorithms: string[] =  [ 
		"SHA1",
		"SHA224",
		"SHA256",
		"SHA384",
		"SHA512",
		"MD5"
	];

	public static readonly SupportedRsaHashFunctionsEncryptDecryptAlgorithms: string[] =  [ 
		"SHA1",
		"SHA224",
		"SHA256",
		"SHA384",
		"SHA512"
	];

	public static readonly SupportedRsaAlgorithms: Map<string, string> =  new Map<string, string>([ 
		["SHA-1", "SHA1_RSA_PKCS"],
		["SHA-224", "SHA224_RSA_PKCS"],
		["SHA-256", "SHA256_RSA_PKCS"],
		["SHA-384", "SHA384_RSA_PKCS"],
		["SHA-512", "SHA512_RSA_PKCS"],
		["Custom...", "Custom"]
	]);

	public static readonly SupportedEccAlgorithms: Map<string, string> =  new Map<string, string>([ 
		["ECDSA", "ECDSA"],
		["SHA-1", "ECDSA_SHA1"],
		["SHA-224", "ECDSA_SHA224"],
		["SHA-256", "ECDSA_SHA256"],
		["SHA-384", "ECDSA_SHA384"],
		["SHA-512", "ECDSA_SHA512"],
		["Custom...", "Custom"]
	]);

	public static readonly SupportedRsaEncryptDecryptAlgorithms: string[] =  [ 
		RsaEncryptDecryptAlgorithms.RsaOaep,
		RsaEncryptDecryptAlgorithms.RsaPkcs,
	];
	
	public static readonly SupportedAesEncryptDecryptAlgorithms: string[] =  [ 
		AesEncryptDecryptAlgorithms.AesCbc,
		AesEncryptDecryptAlgorithms.AesCbcPad,
		AesEncryptDecryptAlgorithms.AesCcm,
		AesEncryptDecryptAlgorithms.AesGcm
	];

	public static readonly EncryptDecryptAlgorithmsByType: Map<graphene.KeyType, string[]> = new Map<graphene.KeyType, string[]>([
		[graphene.KeyType.AES, Definitions.SupportedAesEncryptDecryptAlgorithms],
		[graphene.KeyType.RSA, Definitions.SupportedRsaEncryptDecryptAlgorithms],
		[graphene.KeyType.EC, Array.from(Definitions.SupportedEccAlgorithms.keys())],
		[graphene.KeyType.ECDSA, Array.from(Definitions.SupportedEccAlgorithms.keys())],
	]);
		
	public static readonly AttributeNameTypes: Map<string, graphene.AttributeItemType> = new Map<string, graphene.AttributeItemType>([
		["class", TYPE_NUMBER],
		["token", TYPE_BOOL],
		["private", TYPE_BOOL],
		["label", TYPE_STRING],
		["application", TYPE_STRING],
		["value", TYPE_BUFFER],
		["objectId", TYPE_BUFFER],
		["certType", TYPE_NUMBER],
		["issuer", TYPE_BUFFER],
		["serial", TYPE_BUFFER],
		["issuerAC", TYPE_BUFFER],
		["owner", TYPE_BUFFER],
		["attrTypes", TYPE_BUFFER],
		["trusted", TYPE_BOOL],
		["certCategory", TYPE_NUMBER],
		["javaDomain", TYPE_NUMBER],
		["url", TYPE_STRING],
		["ski", TYPE_BUFFER],
		["aki", TYPE_BUFFER],
		["checkValue", TYPE_BUFFER],	  
		["keyType", TYPE_NUMBER],
		["subject", TYPE_BUFFER],
		["id", TYPE_BUFFER],
		["sensitive", TYPE_BOOL],
		["encrypt", TYPE_BOOL],
		["decrypt", TYPE_BOOL],
		["wrap", TYPE_BOOL],
		["unwrap", TYPE_BOOL],
		["sign", TYPE_BOOL],
		["signRecover", TYPE_BOOL],
		["verify", TYPE_BOOL],
		["verifyRecover", TYPE_BOOL],
		["derive", TYPE_BOOL],
		["startDate", TYPE_DATE],
		["endDate", TYPE_DATE],
		["modulus", TYPE_BUFFER],
		["modulusBits", TYPE_NUMBER],
		["publicExponent", TYPE_BUFFER],
		["privateExponent", TYPE_BUFFER],
		["prime1", TYPE_BUFFER],
		["prime2", TYPE_BUFFER],
		["exp1", TYPE_BUFFER],
		["exp2", TYPE_BUFFER],
		["coefficient", TYPE_BUFFER],
		["prime", TYPE_BUFFER],
		["subprime", TYPE_BUFFER],
		["base", TYPE_BUFFER],
		["primeBits", TYPE_NUMBER],
		["subprimeBits", TYPE_NUMBER],
		["valueBits", TYPE_NUMBER],
		["valueLen", TYPE_NUMBER],
		["extractable", TYPE_BOOL],
		["local", TYPE_BOOL],
		["neverExtractable", TYPE_BOOL],
		["alwaysSensitive", TYPE_BOOL],
		["keyGenMechanism", TYPE_NUMBER],
		["modifiable", TYPE_BOOL],
		["paramsECDSA", TYPE_BUFFER],
		["paramsEC", TYPE_BUFFER],
		["pointEC", TYPE_BUFFER],
		["secondaryAuth", TYPE_BOOL],
		["authPinFlags", TYPE_BUFFER],
		["alwaysAuth", TYPE_BUFFER],
		["wrapWithTrusted", TYPE_BUFFER],
		["wrapTemplate", TYPE_BUFFER],
		["unwrapTemplate", TYPE_BUFFER],
		["otpFormat", TYPE_BUFFER],
		["otpLength", TYPE_BUFFER],
		["otpTimeInterval", TYPE_BUFFER],
		["otpUserFriendlyMode", TYPE_BUFFER],
		["otpChallengeReq", TYPE_BUFFER],
		["otpTimeReq", TYPE_BUFFER],
		["otpCounterReq", TYPE_BUFFER],
		["otpPinReq", TYPE_BUFFER],
		["otpCounter", TYPE_BUFFER],
		["otpTime", TYPE_BUFFER],
		["otpUserId", TYPE_BUFFER],
		["otpServiceId", TYPE_BUFFER],
		["otpServiceLogo", TYPE_BUFFER],
		["otpServiceLogoType", TYPE_BUFFER],
		["hwFeatureType", TYPE_BUFFER],
		["resetOnInit", TYPE_BUFFER],
		["hasReset", TYPE_BUFFER],
		["pixelX", TYPE_BUFFER],
		["pixelY", TYPE_BUFFER],
		["resolution", TYPE_BUFFER],
		["charRows", TYPE_BUFFER],
		["charCols", TYPE_BUFFER],
		["color", TYPE_BUFFER],
		["bitsPerPixel", TYPE_BUFFER],
		["charSets", TYPE_BUFFER],
		["encMethod", TYPE_BUFFER],
		["mimeTypes", TYPE_BUFFER],
		["mechanismType", TYPE_BUFFER],
		["requiredCmsAttrs", TYPE_BUFFER],
		["defaultCmsAttrs", TYPE_BUFFER],
		["supportedCmsAttrs", TYPE_BUFFER],
		["allowedMechanisms", TYPE_BUFFER]
	]);

	public static readonly SupportedAesSizes: string[] = ["128", "192", "256"];
	public static readonly SupportedRsaKeySizes: string[] = ["1024", "2048", "3072", "4096", "8129", "16384"];
	public static readonly SupportedRsaPublicExponents: string[] = ["3", "5", "17", "257", "65537", "custom..."];
	public static readonly SupportedEccNamedCurves: string[] = ["secp192r1", "secp256r1", "secp256k1"];

	public static readonly SupportedCertificateOutput: string[] = ["pem", "ascii", "base64", "hex", "utf8"];
	public static readonly SupportedCertificatInput: string[] = ["pem"];
	public static readonly SupportedEncodingOutput: string[] = ["ascii", "base64", "hex", "utf8"];
	public static readonly SupportedSignEncodingInputData: string[] = ["ascii", "base64", "hex", "utf8"];
	public static readonly SupportedSignEncodingOutputData: string[] = ["ascii", "base64", "hex", "utf8"];
}