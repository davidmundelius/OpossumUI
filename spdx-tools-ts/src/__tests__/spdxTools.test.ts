// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  createSpdxDocument,
  createSpdxJson,
  createSpdxYaml,
} from '../spdxTools';
import {
  Package,
  SpdxDocument,
  SpdxExternalRelationship,
  SpdxPackage,
} from '../types';
jest.mock('uuid', () => ({
  v4: (): string => 'testUUID',
}));

jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());

const emptySpdxPackage: SpdxPackage = {
  SPDXID: '',
  name: 'NOASSERTION',
  versionInfo: 'NOASSERTION',
  licenseConcluded: 'NOASSERTION',
  licenseDeclared: 'NOASSERTION',
  copyrightText: 'NOASSERTION',
  externalRefs: [],
  licenseInfoFromFiles: 'NOASSERTION',
  downloadLocation: 'NOASSERTION',
  filesAnalyzed: false,
};
const SPDXID_OF_ROOT_PACKAGE = 'SPDXRef-RootPackage';
const expectedRootPackage: SpdxPackage = {
  ...emptySpdxPackage,
  SPDXID: SPDXID_OF_ROOT_PACKAGE,
};
const expectedRootRelationship: SpdxExternalRelationship = {
  spdxElementId: 'SPDXRef-DOCUMENT',
  relatedSpdxElement: SPDXID_OF_ROOT_PACKAGE,
  relationshipType: 'DESCRIBES',
};
const expectedBaseSpdxDocument: SpdxDocument = {
  SPDXID: 'SPDXRef-DOCUMENT',
  spdxVersion: 'SPDX-2.2',
  creationInfo: {
    created: '2020-01-01T00:00:00.000Z',
    creators: ['Tool: Opossum'],
  },
  dataLicense: 'CC0-1.0',
  documentDescribes: [SPDXID_OF_ROOT_PACKAGE],
  documentNamespace: 'testUUID',
  hasExtractedLicensingInfos: [],
  packages: [expectedRootPackage],
  relationships: [expectedRootRelationship],
};

describe('createSpdxDocument', () => {
  it('creates an SPDX document given minimal data', () => {
    const spdxDocument = createSpdxDocument('Opossum', { dependencies: [] });
    expect(spdxDocument).toStrictEqual(expectedBaseSpdxDocument);
  });

  it('creates an SPDX document without documentName', () => {
    const spdxDocument = createSpdxDocument('Opossum', { dependencies: [] });
    expect(spdxDocument).not.toHaveProperty('name');
  });

  it('creates an SPDX document with correct header fields', () => {
    const spdxDocument = createSpdxDocument(
      'Opossum',
      { dependencies: [] },
      'document.yaml',
      'data license'
    );
    expect(spdxDocument).toStrictEqual({
      ...expectedBaseSpdxDocument,
      name: 'document.yaml',
      dataLicense: 'data license',
    });
  });

  it('creates correct document in case of one empty attribution', () => {
    const emptyAttribution: Package = { dependencies: [] };
    const spdxDocument = createSpdxDocument('Opossum', {
      dependencies: [emptyAttribution],
    });
    expect(spdxDocument).toStrictEqual({
      ...expectedBaseSpdxDocument,
      hasExtractedLicensingInfos: [],
      packages: [expectedRootPackage],
      relationships: [expectedRootRelationship],
    });
  });

  it('creates correct document in case of two attributions one without license', () => {
    const attribution1: Package = {
      copyright: 'copyright 1',
      license: 'license 1',
      licenseText: 'license text 1',
      url: 'url 1',
      name: 'name 1',
      version: 'version 1',
      namespace: 'namespace 1',
      type: 'type 1',
      appendix: 'appendix 1',
      dependencies: [],
    };
    const attribution2: Package = {
      copyright: 'copyright 2',

      name: 'name 2',
      namespace: 'namespace 2',
      dependencies: [],
      comment: "I'm a comment",
    };
    const spdxDocument = createSpdxDocument('Opossum', {
      dependencies: [attribution1, attribution2],
    });
    expect(spdxDocument).toStrictEqual({
      ...expectedBaseSpdxDocument,
      hasExtractedLicensingInfos: [
        {
          extractedText: 'license text 1',
          licenseId: 'LicenseRef-license-1-0',
          name: 'license 1',
        },
      ],
      packages: [
        expectedRootPackage,
        {
          SPDXID: 'SPDXRef-Package-name-1-0',
          copyrightText: 'copyright 1',
          downloadLocation: 'NOASSERTION',
          externalRefs: [
            {
              referenceCategory: 'PACKAGE_MANAGER',
              referenceLocator:
                'pkg:type 1/namespace%201/name%201@version%201appendix 1',
              referenceType: 'purl',
            },
          ],
          filesAnalyzed: false,
          homepage: 'url 1',
          licenseConcluded: 'LicenseRef-license-1-0',
          licenseDeclared: 'NOASSERTION',
          licenseInfoFromFiles: 'NOASSERTION',
          name: 'name 1',
          versionInfo: 'version 1',
        },
        {
          SPDXID: 'SPDXRef-Package-name-2-1',
          comment: "I'm a comment",
          copyrightText: 'copyright 2',
          downloadLocation: 'NOASSERTION',
          externalRefs: [],
          filesAnalyzed: false,
          licenseConcluded: 'NOASSERTION',
          licenseDeclared: 'NOASSERTION',
          licenseInfoFromFiles: 'NOASSERTION',
          name: 'name 2',
          versionInfo: 'NOASSERTION',
        },
      ],
      relationships: [
        expectedRootRelationship,
        {
          relatedSpdxElement: SPDXID_OF_ROOT_PACKAGE,
          relationshipType: 'DEPENDENCY_OF',
          spdxElementId: 'SPDXRef-Package-name-1-0',
        },
        {
          relatedSpdxElement: SPDXID_OF_ROOT_PACKAGE,
          relationshipType: 'DEPENDENCY_OF',
          spdxElementId: 'SPDXRef-Package-name-2-1',
        },
      ],
    });
  });
});

describe('createSpdxYaml', () => {
  it('creates a yaml', () => {
    const yaml = createSpdxYaml(expectedBaseSpdxDocument);

    expect(yaml.startsWith('SPDXID: SPDXRef-DOCUMENT'));
  });
});

describe('createSpdxJson', () => {
  it('creates a json', () => {
    const json = createSpdxJson(expectedBaseSpdxDocument);

    expect(JSON.parse(json)).toEqual(expectedBaseSpdxDocument);
  });
});
