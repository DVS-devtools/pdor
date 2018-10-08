import React from 'react';
import ReactDOM from 'react-dom';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import YourComponent from './index';

import 'jest-styled-components';

const styles = {
    display: 'inline-block',
    color: '#222',
    padding: '0.5rem 0',
    margin: '0.5rem 1rem',
    background: 'transparent',
    border: '2px solid #222',
    width: '11rem',
    'border-radius': '3px',
};

beforeEach(() => {
    configure({ adapter: new Adapter() });
});

it('renders without crashing', () => {
    const cmp = document.createElement('div');
    ReactDOM.render(<YourComponent />, cmp);
    ReactDOM.unmountComponentAtNode(cmp);
});

it('renders children elements', () => {
    const cmp = shallow(<YourComponent>children</YourComponent>);
    expect(cmp.children().text()).toEqual('children');
});

it('renders the correct computed styles', () => {
    const cmp = shallow(<YourComponent>children</YourComponent>);
    Object.keys(styles).forEach((rule) => {
        expect(cmp).toHaveStyleRule(rule, styles[rule]);
    });
});