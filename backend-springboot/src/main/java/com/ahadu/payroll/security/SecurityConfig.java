package com.ahadu.payroll.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Import HttpMethod
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // Re-added
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
import org.springframework.web.filter.CorsFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.core.Ordered;

import com.ahadu.payroll.service.CustomUserDetailsService;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // IMPORTANT: Re-enabled @PreAuthorize
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
                // .cors() is now handled by the FilterRegistrationBean bean with
                // HIGHEST_PRECEDENCE
                // so we don't need to configure it here again.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll()
                        // IMPORTANT: Permit OPTIONS requests for all paths before any other
                        // authorization rules
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Admin-specific endpoints
                        .requestMatchers("/api/employees/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/payroll/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/settings/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/reports/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/user-roles/**").hasAuthority("ADMIN") // Corrected based on
                                                                                     // UserRoleController
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
                        .requestMatchers("/api/my-profile/**").hasAnyAuthority("USER", "ADMIN") // Corrected to cover
                                                                                                // /api/my-profile/upload-picture
                        .requestMatchers("/api/announcements").hasAnyAuthority("USER", "ADMIN") // GET for all
                                                                                                // announcements
                        .requestMatchers("/api/users/change-password").hasAnyAuthority("USER", "ADMIN") // Assuming this
                                                                                                        // is the
                                                                                                        // correct
                                                                                                        // endpoint for
                                                                                                        // change
                                                                                                        // password
                        .anyRequest().authenticated() // All other requests require authentication
                )
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

        config.setAllowedOriginPatterns(allowedOriginsList);

        // Ensure OPTIONS is explicitly allowed here too, though the SecurityFilterChain
        // permitAll is key
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*")); // Allow all headers for simplicity, refine for production
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type")); // Expose headers if frontend needs to
                                                                                  // read them

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

    // This bean registers the CorsFilter at the highest precedence,
    // ensuring it runs before Spring Security's filter chain.
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(
                new CorsFilter(corsConfigurationSource()));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE); // This ensures it runs before Spring Security's filters
        return bean;
    }
}
