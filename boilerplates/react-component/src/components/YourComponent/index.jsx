import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Button = styled.button`
    display: inline-block;
    border-radius: 3px;
    padding: 0.5rem 0;
    margin: 0.5rem 1rem;
    width: 11rem;
    background: transparent;
    color: #222;
    border: 2px solid #222;
`;

export default class YourComponent extends Component {
    static propTypes = {
        onClick: PropTypes.func
    };

    render() {
        return (
            <Button onClick={this.props.onClick}>{this.props.children}</Button>
        );
    }
}
