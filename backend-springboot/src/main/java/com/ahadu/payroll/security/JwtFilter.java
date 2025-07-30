package com.ahadu.payroll.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ahadu.payroll.service.CustomUserDetailsService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException; // Changed: Ensure this is 'io.jsonwebtoken.SignatureException'
import io.jsonwebtoken.UnsupportedJwtException;
// import io.jsonwebtoken.JwtException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        try {
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                logger.debug("JWT found in header: {}", jwt);

                username = jwtUtil.extractUsername(jwt);
                logger.debug("Username extracted from JWT: {}", username);
            } else {
                logger.debug("No Bearer token found in Authorization header for request: {}", request.getRequestURI());
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.debug("UserDetails loaded for username: {}", username);

                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Successfully authenticated user: {}", username);
                } else {
                    logger.warn("JWT validation failed for user: {}. Token might be expired or invalid.", username);
                }
            }
        } catch (ExpiredJwtException e) {
            logger.warn("JWT Token has expired for request URI: {}. Message: {}", request.getRequestURI(),
                    e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.warn("JWT Token is unsupported for request URI: {}. Message: {}", request.getRequestURI(),
                    e.getMessage());
        } catch (MalformedJwtException e) {
            logger.warn("Invalid JWT Token (malformed) for request URI: {}. Message: {}", request.getRequestURI(),
                    e.getMessage());
        } catch (SignatureException e) { // No change needed here, just ensuring it's the correct import.
            logger.warn(
                    "Invalid JWT signature for request URI: {}. This might be due to a secret key mismatch. Message: {}",
                    request.getRequestURI(), e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.warn("JWT claims string is empty or invalid for request URI: {}. Message: {}",
                    request.getRequestURI(), e.getMessage());
        } catch (Exception e) {
            logger.error("Authentication error during JWT processing for request URI: {}", request.getRequestURI(), e);
        }

        filterChain.doFilter(request, response);
    }
}