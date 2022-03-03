// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactElement, useMemo } from 'react';
import { View } from '../../enums/enums';
import { getSelectedView } from '../../state/selectors/view-selector';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { ReportView } from '../ReportView/ReportView';
import { AttributionView } from '../AttributionView/AttributionView';
import { GlobalPopup } from '../GlobalPopup/GlobalPopup';
import { AuditView } from '../AuditView/AuditView';
import { TopBar } from '../TopBar/TopBar';
import { createTheme } from '@mui/material';
import { useAppSelector } from '../../state/hooks';
import {
  getNewContainedExternalAttributionsAccordionWorker,
  getNewContainedManualAttributionsAccordionWorker,
  ResourceDetailsTabsWorkers,
} from '../../web-workers/get-new-accordion-worker';
import { getExternalData } from '../../state/selectors/all-views-resource-selectors';
import { AttributionData } from '../../../shared/shared-types';

const useStyles = makeStyles({
  root: {
    width: '100vw',
    height: '100vh',
  },
  panelDiv: {
    display: 'flex',
    height: 'calc(100vh - 36px)',
    width: '100%',
    overflow: 'hidden',
  },
});

const theme = createTheme({
  components: {
    MuiTypography: {
      styleOverrides: {
        body1: {
          fontSize: '0.85rem',
          letterSpacing: '0.01071em',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          letterSpacing: '0.01071em',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          letterSpacing: '0.01071em',
        },
      },
    },
  },
});

export function App(): ReactElement {
  const selectedView = useAppSelector(getSelectedView);

  const resourceDetailsTabsWorkers: ResourceDetailsTabsWorkers = {
    containedExternalAttributionsAccordionWorker:
      getNewContainedExternalAttributionsAccordionWorker(),
    containedManualAttributionsAccordionWorker:
      getNewContainedManualAttributionsAccordionWorker(),
  };

  const externalData = useAppSelector(getExternalData);
  useMemo(() => {
    try {
      loadExternalDataInWebWorker(
        externalData,
        resourceDetailsTabsWorkers.containedExternalAttributionsAccordionWorker
      );
    } catch (error) {
      console.info('WebWorker error in App component: ', error);
    }
  }, [
    externalData,
    resourceDetailsTabsWorkers.containedExternalAttributionsAccordionWorker,
  ]);

  function getSelectedViewContainer(): ReactElement {
    switch (selectedView) {
      case View.Audit:
        return (
          <AuditView resourceDetailsTabsWorkers={resourceDetailsTabsWorkers} />
        );
      case View.Attribution:
        return <AttributionView />;
      case View.Report:
        return <ReportView />;
    }
  }

  return (
    <ErrorBoundary>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <GlobalPopup />
          <div className={useStyles().root}>
            <TopBar />
            <div className={useStyles().panelDiv}>
              {getSelectedViewContainer()}
            </div>
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </ErrorBoundary>
  );
}

function loadExternalDataInWebWorker(
  externalData: AttributionData,
  worker: Worker
): void {
  worker.postMessage({ externalData });
}
