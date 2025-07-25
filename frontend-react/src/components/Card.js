import React from 'react';
import PropTypes from 'prop-types';
import '../App.css';  // Import the CSS file where styles are defined

function Card({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.defaultProps = {
  title: '',
  className: '',
};

export default Card;
