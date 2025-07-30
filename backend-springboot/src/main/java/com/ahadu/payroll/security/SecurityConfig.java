package com.ahadu.payroll.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ahadu.payroll.service.CustomUserDetailsService;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Value("${frontend.origins}")
    private String frontendOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        .requestMatchers("/api/employees/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/payroll/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/settings/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/reports/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/users/roles/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/attendance/admin/**", "/api/leave-requests/admin/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers("/api/salary-components/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/announcements/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/payroll/my/**", "/api/payslips/**").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/leave-requests/submit", "/api/leave-requests/my/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/attendance/my/**", "/api/attendance/clock/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/profile/**", "/api/my-profile").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/announcements").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/users/change-password").hasAnyAuthority("USER", "ADMIN")
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);

        List<String> allowedOriginsList = Arrays.stream(frontendOrigins.split(","))
                .map(String::trim)
                .collect(Collectors.toList());

        // Use allowedOriginPatterns to support wildcard and multiple origins with
        // credentials
        config.setAllowedOriginPatterns(allowedOriginsList);

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
