// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  AttributionIdWithCount,
  Attributions,
  ExternalAttributionSources,
} from '../../../../shared/shared-types';
import {
  getAttributionIdsWithCountForSource,
  getSortedSources,
} from '../package-panel-helpers';
import { ATTRIBUTION_SOURCES } from '../../../../shared/shared-constants';

describe('PackagePanel helpers', () => {
  const testAttributionIds: Array<AttributionIdWithCount> = [
    { attributionId: 'jquery' },
    { attributionId: 'b_unknown', childrenWithAttributionCount: 5 },
    { attributionId: 'react', childrenWithAttributionCount: 5 },
    { attributionId: 'vue', childrenWithAttributionCount: 500 },
    { attributionId: 'a_unknown', childrenWithAttributionCount: 3 },
    { attributionId: 'reuser', childrenWithAttributionCount: 3 },
    { attributionId: 'blub', childrenWithAttributionCount: 1 },
  ];
  const testAttributions: Attributions = {
    react: {
      source: {
        name: 'MERGER',
        documentConfidence: 100,
      },
      packageName: 'React',
      packageVersion: '16.5.0',
    },
    jquery: {
      source: {
        name: 'HC',
        documentConfidence: 100,
      },
      packageName: 'JQuery',
    },
    blub: {
      source: {
        name: 'HINT',
        documentConfidence: 10,
      },
      packageName: 'Blub',
    },
    b_unknown: {
      source: {
        name: 'a_unknown',
        documentConfidence: 100,
      },
    },
    vue: {
      source: {
        name: 'SC',
        documentConfidence: 100,
      },
      packageName: 'Vue',
    },
    a_unknown: {
      source: {
        name: 'b_unknown',
        documentConfidence: 100,
      },
    },
    reuser: {
      source: {
        name: 'REUSER:HHC',
        documentConfidence: 100,
      },
    },
  };

  test('getAttributionIdsWithCountForSource returns attributionIdsWithCountForSource', () => {
    const sourceName = 'MERGER';
    const expectedAttributionIdsWithCountForSource: Array<AttributionIdWithCount> =
      [
        {
          attributionId: 'react',
          childrenWithAttributionCount: 5,
        },
      ];
    expect(
      getAttributionIdsWithCountForSource(
        testAttributionIds,
        testAttributions,
        sourceName
      )
    ).toEqual(expectedAttributionIdsWithCountForSource);
  });

  test('getAttributionIdsWithCountForSource returns empty array', () => {
    const sourceName = 'something';
    expect(
      getAttributionIdsWithCountForSource(
        testAttributionIds,
        testAttributions,
        sourceName
      )
    ).toEqual([]);
  });

  test('getSources returns sorted sources', () => {
    const expectedSortedSources = [
      'MERGER',
      'REUSER:HHC',
      'SC',
      'HC',
      'HINT',
      'a_unknown',
      'b_unknown',
    ];
    expect(
      getSortedSources(
        testAttributions,
        testAttributionIds,
        ATTRIBUTION_SOURCES
      )
    ).toEqual(expectedSortedSources);
  });

  test('getSources returns empty array for no attributionIds', () => {
    expect(getSortedSources(testAttributions, [], ATTRIBUTION_SOURCES)).toEqual(
      []
    );
  });

  test('getSources returns empty string for no attributions', () => {
    expect(
      getSortedSources({}, testAttributionIds, ATTRIBUTION_SOURCES)
    ).toEqual(['']);
  });

  test('getSources sorts alphabetically if priority is identical', () => {
    const testAttributionSources: ExternalAttributionSources = {
      MERGER: { name: 'Suggested', priority: 1 },
      HHC: { name: 'High High Compute', priority: 1 },
      MS: { name: 'Metadata Scanner', priority: 1 },
      'REUSER:HHC': { name: 'High High Compute (old scan)', priority: 1 },
      'REUSER:MS': { name: 'Metadata Scanner (old scan)', priority: 1 },
      'REUSER:SC': { name: 'ScanCode (old scan)', priority: 1 },
      'REUSER:HC': { name: 'High Compute (old scan)', priority: 1 },
      SC: { name: 'ScanCode', priority: 1 },
      HC: { name: 'High Compute', priority: 1 },
      HINT: { name: 'Hint', priority: 1 },
    };
    expect(
      getSortedSources(
        testAttributions,
        testAttributionIds,
        testAttributionSources
      )
    ).toEqual([
      'HC', // High Compute
      'REUSER:HHC', // High High Compute (old scan)
      'HINT', // Hint
      'SC', // ScanCode
      'MERGER', // Suggested
      'a_unknown',
      'b_unknown',
    ]);
  });
});
