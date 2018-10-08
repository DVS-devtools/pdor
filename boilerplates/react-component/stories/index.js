import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import YourComponent from '../src/components/YourComponent';

storiesOf('YourComponent', module)
    .add('with text', () => (
        <YourComponent onClick={action('clicked')}>Hello Button</YourComponent>
    ));