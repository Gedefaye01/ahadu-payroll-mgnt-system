package com.ahadu.payroll.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders; // Import Decoders for Base64 decoding
import io.jsonwebtoken.security.Keys; // Import Keys for secure key generation
import io.jsonwebtoken.JwtException; // Explicitly import JwtException for comprehensive error handling
import io.jsonwebtoken.MalformedJwtException; // Specific exception for malformed JWTs
import io.jsonwebtoken.ExpiredJwtException; // Specific exception for expired JWTs
import io.jsonwebtoken.UnsupportedJwtException; // Specific exception for unsupported JWTs
import io.jsonwebtoken.security.SecurityException; // Specific exception for security-related issues (e.g., invalid signature)

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret; // This will hold your Base64 encoded secret from application.properties

    @Value("${jwt.expirationMs}")
    private long expirationMs; // This will hold the expiration time in milliseconds from
                               // application.properties

    // This method provides the secure signing key by decoding the Base64 secret.
    // It ensures the key is properly formatted and of sufficient strength for
    // HS512.
    private Key getSigningKey() {
        // Decode the Base64 secret string into bytes
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        // Create an HMAC-SHA key from the decoded bytes. Keys.hmacShaKeyFor ensures the
        // key is suitable for the algorithm.
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extracts the username (subject) from a JWT token.
     * 
     * @param token The JWT token string.
     * @return The username extracted from the token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from a JWT token.
     * 
     * @param token The JWT token string.
     * @return The expiration Date extracted from the token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from a JWT token using a claims resolver function.
     * 
     * @param token          The JWT token string.
     * @param claimsResolver A function to resolve the desired claim from the Claims
     *                       object.
     * @param <T>            The type of the claim to be extracted.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims (payload) from a JWT token.
     * This method also validates the token's signature using the signing key.
     * 
     * @param token The JWT token string.
     * @return The Claims object containing all payload data.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Use the securely generated key
                .build()
                .parseClaimsJws(token) // Parses the JWS (Signed JWT) and validates the signature
                .getBody(); // Returns the claims (payload)
    }

    /**
     * Checks if a JWT token has expired.
     * 
     * @param token The JWT token string.
     * @return True if the token is expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a new JWT token for a given username.
     * 
     * @param username The subject (username) for whom the token is generated.
     * @return The generated JWT token string.
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>(); // You can add custom claims here if needed
        return createToken(claims, username);
    }

    /**
     * Creates the JWT token with specified claims, subject, issued at, expiration,
     * and signs it using HS512 algorithm with the secure key.
     * 
     * @param claims  Custom claims to include in the token payload.
     * @param subject The subject (username) of the token.
     * @return The complete JWT token string.
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // Use expirationMs from properties
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Ensure HS512 is used with the strong key
                .compact(); // Builds and compacts the JWT into a string
    }

    /**
     * Validates a JWT token against a given username and checks for expiration.
     * This method also handles various JWT-related exceptions.
     * 
     * @param token    The JWT token string to validate.
     * @param username The expected username (subject) in the token.
     * @return True if the token is valid for the user and not expired, false
     *         otherwise.
     */
    public boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (SecurityException | MalformedJwtException e) {
            System.err.println("Invalid JWT signature or malformed token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        } catch (JwtException e) {
            // Catch any other JWT-related exceptions
            System.err.println("JWT Validation failed: " + e.getMessage());
        }
        return false;
    }
}
