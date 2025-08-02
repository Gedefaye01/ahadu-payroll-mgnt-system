package com.ahadu.payroll.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter; // NEW: Import CorsFilter
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.core.Ordered;

import com.ahadu.payroll.service.CustomUserDetailsService;
import com.ahadu.payroll.service.LoginAttemptService;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Value("${frontend.origins}")
    private String frontendOrigins;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // IMPORTANT: Added the new endpoint for ADMIN
                        .requestMatchers("/api/users").hasAuthority("ADMIN")
                        
                        // Admin-specific endpoints
                        .requestMatchers("/api/employees/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/payroll/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/settings/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/reports/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/user-roles/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/attendance/admin/**", "/api/leave-requests/admin/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers("/api/salary-components/**").hasAuthority("ADMIN")
                        // Announcements: Admin can POST, PUT, DELETE. All authenticated can GET.
                        .requestMatchers(HttpMethod.POST, "/api/announcements").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/announcements/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/announcements/**").hasAuthority("ADMIN")

                        // User/Admin shared access endpoints
                        .requestMatchers("/api/payroll/my-payslips", "/api/payroll/employee/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/leave-requests/submit", "/api/leave-requests/my/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/attendance/my/**", "/api/attendance/clock/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/my-profile/**").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/announcements").hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/users/change-password").hasAnyAuthority("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                // NEW: Configure formLogin to use custom failure handler
                .formLogin(form -> form
                    .failureHandler(authenticationFailureHandler())); // Use the custom failure handler

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

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(
                new CorsFilter(corsConfigurationSource()));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }

    // NEW BEAN: Custom AuthenticationFailureHandler
    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler(loginAttemptService);
    }
}
